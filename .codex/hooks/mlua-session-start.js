#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function findProjectRoot(startPath) {
  let current = path.resolve(startPath || process.cwd());

  try {
    if (!fs.statSync(current).isDirectory()) current = path.dirname(current);
  } catch (_) {}

  while (true) {
    if (path.basename(current) === 'RootDesk') return path.dirname(current);

    try {
      if (fs.statSync(path.join(current, 'RootDesk')).isDirectory()) return current;
    } catch (_) {}

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function splitArgs(raw) {
  return String(raw || '').trim().split(/\s+/).filter(Boolean);
}

function emitAdditionalContext(message) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: message,
    },
  }));
}

const input = readInput();
const projectRoot = process.env.MLUA_LSP_PROJECT_ROOT || findProjectRoot(input.cwd);

if (!projectRoot) {
  if (process.env.MLUA_LSP_HOOK_REPORT_NOOP === '1') {
    emitAdditionalContext(`Codex project hook reached; skipped mLua LSP start because no RootDesk was found from ${input.cwd || process.cwd()}.`);
  }
  process.exit(0);
}

const cmd = process.env.MLUA_LSP_CMD || 'mlua-lsp';
const args = splitArgs(process.env.MLUA_LSP_ARGS).concat(['start', projectRoot]);
const timeout = Number.parseInt(process.env.MLUA_LSP_HOOK_START_TIMEOUT_MS || '120000', 10);

const result = spawnSync(cmd, args, {
  encoding: 'utf8',
  timeout: Number.isFinite(timeout) ? timeout : 120000,
  windowsHide: true,
});

if (result.error || result.status !== 0) {
  const message = result.error?.message || result.stderr || `exit ${result.status}`;
  emitAdditionalContext(`mLua LSP daemon start failed: ${String(message).trim()}`);
  process.exit(0);
}

if (process.env.MLUA_LSP_HOOK_REPORT_START === '1') {
  emitAdditionalContext(`mLua LSP daemon is ready for ${projectRoot}.`);
}
