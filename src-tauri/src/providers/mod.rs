pub mod anthropic;
pub mod openai;
pub mod google;
pub mod xai;
pub mod deepseek;
pub mod mistral;
pub mod together;
pub mod cohere;

use anyhow::Result;
use futures::Stream;
use std::pin::Pin;

use crate::models::config::ChatMessage;

pub type TokenStream = Pin<Box<dyn Stream<Item = Result<String>> + Send>>;

#[allow(dead_code)]
pub trait AIProvider: Send + Sync {
    fn stream_chat(
        &self,
        api_key: &str,
        model: &str,
        messages: &[ChatMessage],
        system_prompt: Option<&str>,
    ) -> impl std::future::Future<Output = Result<TokenStream>> + Send;
}
