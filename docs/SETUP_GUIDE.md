# Development Setup Guide

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

Verify: `rustc --version` (should be 1.77+)

### 2. Install Node.js

Download from [nodejs.org](https://nodejs.org/) (v18 or later) or use nvm:

```bash
nvm install 18
nvm use 18
```

Verify: `node --version`

### 3. Install Tauri CLI

```bash
cargo install tauri-cli --version "^2"
```

Verify: `cargo tauri --version`

### 4. Install Xcode Command Line Tools

```bash
xcode-select --install
```

## Running the App

### From Terminal

```bash
cd council-of-ai-agents
npm install
cargo tauri dev
```

This starts the Vite dev server and the Tauri app with hot-reload.

### From Xcode

1. Open `CouncilOfAIAgents.xcodeproj`
2. Select the **Dev** scheme
3. Press Cmd+B to build (runs `cargo tauri dev`)

## Getting API Keys

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to Settings > API Keys
3. Create a new key

### OpenAI (GPT)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key

### Google (Gemini)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a key for a Google Cloud project

### xAI (Grok)
1. Go to [console.x.ai](https://console.x.ai)
2. Navigate to API Keys
3. Create a new key

## Building for Production

```bash
cargo tauri build
```

The `.app` bundle will be at `src-tauri/target/release/bundle/macos/`.
