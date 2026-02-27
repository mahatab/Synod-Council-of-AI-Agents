# API Provider Integrations

## Overview

All API calls are made from the Rust backend. API keys are never exposed to the frontend JavaScript context. Responses are streamed via Tauri's event system.

## Anthropic (Claude)

- **Endpoint**: `POST https://api.anthropic.com/v1/messages`
- **Auth**: `x-api-key` header
- **Streaming**: Server-Sent Events (SSE)
- **Key event types**: `content_block_delta` with `delta.text`
- **System prompt**: Top-level `system` field in request body
- **Implementation**: `src-tauri/src/providers/anthropic.rs`

## OpenAI (GPT)

- **Endpoint**: `POST https://api.openai.com/v1/chat/completions`
- **Auth**: `Authorization: Bearer {key}` header
- **Streaming**: Server-Sent Events (SSE)
- **Key event types**: `choices[0].delta.content`
- **System prompt**: `system` role message in messages array
- **Implementation**: `src-tauri/src/providers/openai.rs`

## Google (Gemini)

- **Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent`
- **Auth**: `key` query parameter
- **Streaming**: SSE with `alt=sse` query parameter
- **Key event types**: `candidates[0].content.parts[].text`
- **System prompt**: `systemInstruction` field in request body
- **Note**: Uses `model` role instead of `assistant`
- **Implementation**: `src-tauri/src/providers/google.rs`

## xAI (Grok)

- **Endpoint**: `POST https://api.x.ai/v1/chat/completions`
- **Auth**: `Authorization: Bearer {key}` header
- **Streaming**: OpenAI-compatible SSE format
- **Key event types**: Same as OpenAI (`choices[0].delta.content`)
- **System prompt**: `system` role message in messages array
- **Implementation**: `src-tauri/src/providers/xai.rs`
