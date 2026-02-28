use futures::StreamExt;
use tauri::{command, AppHandle, Emitter};

use crate::models::config::{ChatMessage, Provider, StreamToken};
use crate::providers::{
    anthropic::AnthropicProvider, cohere::CohereProvider, deepseek::DeepSeekProvider,
    google::GoogleProvider, mistral::MistralProvider, openai::OpenAIProvider,
    together::TogetherProvider, xai::XAIProvider,
};

#[command]
pub async fn stream_chat(
    app: AppHandle,
    provider: Provider,
    model: String,
    messages: Vec<ChatMessage>,
    system_prompt: Option<String>,
    api_key: String,
    stream_id: String,
) -> Result<String, String> {
    let system_ref = system_prompt.as_deref();
    let event_name = format!("stream-token-{}", stream_id);

    let result = match provider {
        Provider::Anthropic => {
            let p = AnthropicProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::OpenAI => {
            let p = OpenAIProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::Google => {
            let p = GoogleProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::XAI => {
            let p = XAIProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::DeepSeek => {
            let p = DeepSeekProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::Mistral => {
            let p = MistralProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::Together => {
            let p = TogetherProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
        Provider::Cohere => {
            let p = CohereProvider::new();
            p.stream_chat(&api_key, &model, &messages, system_ref).await
        }
    };

    match result {
        Ok(mut stream) => {
            let mut full_response = String::new();

            while let Some(token_result) = stream.next().await {
                match token_result {
                    Ok(token) => {
                        full_response.push_str(&token);
                        let _ = app.emit(
                            &event_name,
                            StreamToken {
                                stream_id: stream_id.clone(),
                                token,
                                done: false,
                                error: None,
                            },
                        );
                    }
                    Err(e) => {
                        let _ = app.emit(
                            &event_name,
                            StreamToken {
                                stream_id: stream_id.clone(),
                                token: String::new(),
                                done: true,
                                error: Some(e.to_string()),
                            },
                        );
                        return Err(e.to_string());
                    }
                }
            }

            let _ = app.emit(
                &event_name,
                StreamToken {
                    stream_id: stream_id.clone(),
                    token: String::new(),
                    done: true,
                    error: None,
                },
            );

            Ok(full_response)
        }
        Err(e) => {
            let _ = app.emit(
                &event_name,
                StreamToken {
                    stream_id: stream_id.clone(),
                    token: String::new(),
                    done: true,
                    error: Some(e.to_string()),
                },
            );
            Err(e.to_string())
        }
    }
}
