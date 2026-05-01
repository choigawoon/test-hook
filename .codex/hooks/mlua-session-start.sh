#!/bin/sh
set -eu

case "$0" in
  */*) HOOK_DIR=${0%/*} ;;
  *) HOOK_DIR=. ;;
esac
HOOK_DIR=$(CDPATH= cd -- "$HOOK_DIR" && pwd)
NODE_BIN=${NODE_BIN:-node}
MLUA_LSP_CMD=${MLUA_LSP_CMD:-/Users/choigawoon/.nvm/versions/node/v22.22.0/bin/mlua-lsp}

emit_context() {
  # Keep this JSON shell-only so missing Node.js can still produce a useful hook message.
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$1"
}

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  emit_context "Codex project hook reached, but Node.js is not installed or not on PATH. Ask the AI agent to install Node.js, or install it manually from https://nodejs.org/ and restart Codex."
  exit 0
fi

if [ ! -x "$MLUA_LSP_CMD" ]; then
  if command -v mlua-lsp >/dev/null 2>&1; then
    MLUA_LSP_CMD=$(command -v mlua-lsp)
  else
    emit_context "Codex project hook reached, but mlua-lsp was not found. Ask the AI agent to install the mLua LSP package, then restart Codex."
    exit 0
  fi
fi

export MLUA_LSP_CMD
export MLUA_LSP_HOOK_REPORT_START=${MLUA_LSP_HOOK_REPORT_START:-1}
export MLUA_LSP_HOOK_REPORT_NOOP=${MLUA_LSP_HOOK_REPORT_NOOP:-1}

exec "$NODE_BIN" "$HOOK_DIR/mlua-session-start.js"
