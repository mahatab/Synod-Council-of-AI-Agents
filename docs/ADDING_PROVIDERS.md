# Adding a New AI Provider

This guide walks through adding a new AI provider to the council.

## Step 1: Add the Rust Provider

Create `src-tauri/src/providers/your_provider.rs`:

```rust
use anyhow::{anyhow, Result};
use bytes::Bytes;
use futures::stream::{self, StreamExt};
use reqwest::Client;
use serde_json::{json, Value};

use crate::models::config::ChatMessage;
use super::TokenStream;

pub struct YourProvider {
    client: Client,
}

impl YourProvider {
    pub fn new() -> Self {
        Self { client: Client::new() }
    }

    pub async fn stream_chat(
        &self,
        api_key: &str,
        model: &str,
        messages: &[ChatMessage],
        system_prompt: Option<&str>,
    ) -> Result<TokenStream> {
        // Build the request body for your provider's API
        // Make the HTTP request with streaming
        // Parse SSE/streaming chunks
        // Return a TokenStream
    }
}
```

## Step 2: Register the Provider

1. Add to `src-tauri/src/providers/mod.rs`:
   ```rust
   pub mod your_provider;
   ```

2. Add to the `Provider` enum in `src-tauri/src/models/config.rs`:
   ```rust
   pub enum Provider {
       // ...existing...
       YourProvider,
   }
   ```

3. Add the match arm in `src-tauri/src/commands/api_calls.rs`:
   ```rust
   Provider::YourProvider => {
       let p = YourProvider::new();
       p.stream_chat(&api_key, &model, &messages, system_ref).await
   }
   ```

## Step 3: Add Frontend Configuration

In `src/types/index.ts`, add your provider to the `PROVIDERS` array:

```typescript
{
  id: 'your_provider',
  name: 'Your Provider',
  keychainService: 'com.council-of-ai-agents.your-provider',
  models: [
    { id: 'model-id', name: 'Model Name' },
  ],
  apiKeyUrl: 'https://your-provider.com/api-keys',
  apiKeySteps: [
    'Go to your-provider.com',
    'Navigate to API settings',
    'Create and copy your API key',
  ],
}
```

## Step 4: Test

1. Run `cargo check` in `src-tauri/` to verify Rust code compiles
2. Run `npx tsc --noEmit` to verify TypeScript
3. Run `cargo tauri dev` and add your provider in settings
