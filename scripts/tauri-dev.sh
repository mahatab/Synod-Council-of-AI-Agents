#!/bin/bash
# Wrapper script for cargo tauri dev, used by Xcode Dev scheme
export PATH="$HOME/.cargo/bin:$PATH"
cd "$(dirname "$0")/.."
exec cargo tauri dev
