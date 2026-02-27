# Contributing to Council of AI Agents

Thank you for your interest in contributing! This guide will help you get set up.

## Development Setup

### Prerequisites

1. **macOS** 10.15+
2. **Rust** 1.77+ via [rustup](https://rustup.rs/)
3. **Node.js** 18+ from [nodejs.org](https://nodejs.org/)
4. **Tauri CLI v2**: `cargo install tauri-cli --version "^2"`

### Getting Started

```bash
git clone https://github.com/your-username/council-of-ai-agents.git
cd council-of-ai-agents
npm install
cargo tauri dev
```

### Project Layout

- `src/` - React/TypeScript frontend
- `src-tauri/src/` - Rust backend
  - `commands/` - Tauri IPC command handlers
  - `providers/` - API provider implementations (Anthropic, OpenAI, Google, xAI)
  - `models/` - Shared data structures

## Adding a New AI Provider

See [docs/ADDING_PROVIDERS.md](docs/ADDING_PROVIDERS.md) for a step-by-step tutorial.

## Code Style

### TypeScript
- Functional components with hooks
- Zustand for state management
- Tailwind CSS for styling (use CSS variables from `globals.css`)

### Rust
- Standard `rustfmt` formatting
- Use `anyhow::Result` for error handling
- Streaming responses via Tauri events

## Pull Request Process

1. Fork and create a feature branch from `main`
2. Make your changes
3. Ensure `cargo check` and `npx tsc --noEmit` both pass
4. Write a clear PR description explaining what and why
5. Submit for review

## Reporting Issues

Use the GitHub issue templates:
- **Bug Report** - For bugs and unexpected behavior
- **Feature Request** - For new features and enhancements
