use anyhow::{anyhow, Result};
use bytes::Bytes;
use futures::stream::{self, StreamExt};
use reqwest::Client;
use serde_json::{json, Value};

use crate::models::config::ChatMessage;
use super::TokenStream;

pub struct GoogleProvider {
    client: Client,
}

impl GoogleProvider {
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
        let contents: Vec<Value> = messages
            .iter()
            .map(|m| {
                let role = match m.role.as_str() {
                    "assistant" => "model",
                    other => other,
                };
                json!({
                    "role": role,
                    "parts": [{ "text": m.content }]
                })
            })
            .collect();

        let mut body = json!({
            "contents": contents
        });

        if let Some(system) = system_prompt {
            body["systemInstruction"] = json!({
                "parts": [{ "text": system }]
            });
        }

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:streamGenerateContent?alt=sse&key={}",
            model, api_key
        );

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_default();
            return Err(anyhow!(
                "Google Gemini API error ({}): {}",
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
                        if let Ok(event) = serde_json::from_str::<Value>(data) {
                            if let Some(parts) = event["candidates"][0]["content"]["parts"].as_array() {
                                for part in parts {
                                    if let Some(text) = part["text"].as_str() {
                                        tokens.push(text.to_string());
                                    }
                                }
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
