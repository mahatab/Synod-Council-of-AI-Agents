# Architecture

## Overview

Council of AI Agents is a Tauri v2 application with a Rust backend and React frontend.

```
┌─────────────────────────────────────────┐
│            React Frontend               │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ ChatView │  │ Settings │  │Sidebar│ │
│  └─────┬────┘  └─────┬────┘  └───┬───┘ │
│        │             │            │     │
│  ┌─────┴─────────────┴────────────┴──┐  │
│  │         Zustand Stores            │  │
│  │  councilStore │ settingsStore     │  │
│  │  sessionStore                     │  │
│  └──────────────┬────────────────────┘  │
│                 │ invoke() / listen()   │
├─────────────────┼───────────────────────┤
│                 │ Tauri IPC Bridge      │
├─────────────────┼───────────────────────┤
│            Rust Backend                 │
│  ┌──────────────┴────────────────────┐  │
│  │           Commands                │  │
│  │  api_calls │ keychain │ sessions  │  │
│  └──────────────┬────────────────────┘  │
│  ┌──────────────┴────────────────────┐  │
│  │           Providers               │  │
│  │  anthropic │ openai │ google │xai │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      macOS Keychain │ File I/O    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Council Discussion State Machine

```
IDLE ──► USER_INPUT ──► GENERATING_SYSTEM_PROMPTS ──► MODEL_TURN
                                                         │
                                                    ┌────┴────┐
                                                    │         │
                                               CLARIFYING  (next model)
                                                  Q&A         │
                                                    │    MODEL_TURN
                                                    │         │
                                                    └────┬────┘
                                                         │
                                                   MASTER_VERDICT
                                                         │
                                                      COMPLETE
```

## Streaming Architecture

1. Frontend calls `invoke("stream_chat", { provider, model, messages, ... })`
2. Rust backend creates an HTTP request with streaming to the provider API
3. As SSE chunks arrive, Rust parses them and emits Tauri events
4. Frontend listens for `stream-token-{streamId}` events and appends tokens
5. When streaming completes, the invoke returns the full response

## Data Storage

- **API Keys**: macOS Keychain via `security-framework` crate
- **Settings**: JSON file at `~/Library/Preferences/council-of-ai-agents/settings.json`
- **Sessions**: JSON files at `~/Library/Application Support/council-of-ai-agents/sessions/` (configurable)
