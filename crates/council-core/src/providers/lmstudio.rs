use anyhow::{anyhow, Result};
use reqwest::Client;
use serde_json::{json, Value};

use crate::models::config::ChatMessage;
use super::{parse_sse_stream, StreamEvent, TokenStream, UsageData};

const DEFAULT_BASE_URL: &str = "http://localhost:1234/v1";

pub struct LMStudioProvider {
    client: Client,
    base_url: String,
}

impl LMStudioProvider {
    pub fn new(base_url: Option<&str>) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url
                .filter(|s| !s.is_empty())
                .unwrap_or(DEFAULT_BASE_URL)
                .trim_end_matches('/')
                .to_string(),
        }
    }

    pub async fn stream_chat(
        &self,
        _api_key: &str,
        model: &str,
        messages: &[ChatMessage],
        system_prompt: Option<&str>,
        _web_search_enabled: bool,
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
            .post(format!("{}/chat/completions", self.base_url))
            .header("Authorization", "Bearer lm-studio")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_default();
            return Err(anyhow!(
                "LM Studio API error ({}): {}",
                status,
                error_body
            ));
        }

        let byte_stream = response.bytes_stream();

        Ok(parse_sse_stream(byte_stream, |event| {
            let mut events = Vec::new();

            if let Some(content) = event["choices"][0]["delta"]["content"].as_str() {
                events.push(StreamEvent::Token(content.to_string()));
            }

            if let Some(usage) = event.get("usage") {
                if let (Some(input), Some(output)) = (
                    usage["prompt_tokens"].as_u64(),
                    usage["completion_tokens"].as_u64(),
                ) {
                    events.push(StreamEvent::Usage(UsageData {
                        input_tokens: input as u32,
                        output_tokens: output as u32,
                    }));
                }
            }

            events
        }))
    }

    /// Fetch available models from the LM Studio /v1/models endpoint.
    pub async fn list_models(&self) -> Result<Vec<LMStudioModel>> {
        let response = self
            .client
            .get(format!("{}/models", self.base_url))
            .header("Authorization", "Bearer lm-studio")
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_default();
            return Err(anyhow!(
                "LM Studio API error ({}): {}",
                status,
                error_body
            ));
        }

        let body: Value = response.json().await?;
        let models = body["data"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter_map(|m| {
                        m["id"].as_str().map(|id| LMStudioModel {
                            id: id.to_string(),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();

        Ok(models)
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LMStudioModel {
    pub id: String,
}
