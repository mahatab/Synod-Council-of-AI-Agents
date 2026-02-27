#!/bin/bash
# Wrapper script for cargo tauri build, used by Xcode Build scheme
export PATH="$HOME/.cargo/bin:$PATH"
cd "$(dirname "$0")/.."
exec cargo tauri build
