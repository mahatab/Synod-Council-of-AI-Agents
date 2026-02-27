use anyhow::{anyhow, Result};
use bytes::Bytes;
use futures::stream::{self, StreamExt};
use reqwest::Client;
use serde_json::{json, Value};

use crate::models::config::ChatMessage;
use super::TokenStream;

pub struct OpenAIProvider {
    client: Client,
}

impl OpenAIProvider {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn stream_chat(
        &self,
        api_key: &str,
        model: &str,
        messages: &[ChatMessage],
        system_prompt: Option<&str>,
    ) -> Result<TokenStream> {
        let mut api_messages: Vec<Value> = Vec::new();

        if let Some(system) = system_prompt {
            api_messages.push(json!({
                "role": "system",
                "content": system
            }));
        }

        for m in messages {
            api_messages.push(json!({
                "role": m.role,
                "content": m.content
            }));
        }

        let body = json!({
            "model": model,
            "messages": api_messages,
            "stream": true
        });

        let response = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_default();
            return Err(anyhow!(
                "OpenAI API error ({}): {}",
                status,
                error_body
            ));
        }

        let byte_stream = response.bytes_stream();

        let token_stream = byte_stream
            .map(|chunk_result| -> Result<Vec<String>> {
                let chunk: Bytes = chunk_result.map_err(|e| anyhow!("Stream error: {}", e))?;
                let text = String::from_utf8_lossy(&chunk);
                let mut tokens = Vec::new();

                for line in text.lines() {
                    if let Some(data) = line.strip_prefix("data: ") {
                        if data == "[DONE]" {
                            continue;
                        }
                        if let Ok(event) = serde_json::from_str::<Value>(data) {
                            if let Some(content) =
                                event["choices"][0]["delta"]["content"].as_str()
                            {
                                tokens.push(content.to_string());
                            }
                        }
                    }
                }

                Ok(tokens)
            })
            .flat_map(|result| match result {
                Ok(tokens) => stream::iter(tokens.into_iter().map(Ok).collect::<Vec<_>>()),
                Err(e) => stream::iter(vec![Err(e)]),
            });

        Ok(Box::pin(token_stream))
    }
}
