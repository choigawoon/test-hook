#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
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

function commandExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'command';
  const args = process.platform === 'win32' ? [command] : ['-v', command];
  const result = spawnSync(checker, args, {
    encoding: 'utf8',
    shell: process.platform !== 'win32',
    windowsHide: true,
  });

  if (result.status !== 0) return null;
  const firstLine = String(result.stdout || '').split(/\r?\n/).find(Boolean);
  return firstLine || command;
}

function resolveMluaCommand() {
  if (process.env.MLUA_LSP_CMD) return process.env.MLUA_LSP_CMD;

  const localMacNvmBin = path.join(os.homedir(), '.nvm', 'versions', 'node', 'v22.22.0', 'bin', 'mlua-lsp');
  if (process.platform !== 'win32' && fs.existsSync(localMacNvmBin)) return localMacNvmBin;

  const fromPath = commandExists(process.platform === 'win32' ? 'mlua-lsp.cmd' : 'mlua-lsp') || commandExists('mlua-lsp');
  if (fromPath) return fromPath;

  return 'mlua-lsp';
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
const nodeVersion = process.version || 'unknown';
const reportNoop = process.env.MLUA_LSP_HOOK_REPORT_NOOP !== '0';
const reportStart = process.env.MLUA_LSP_HOOK_REPORT_START !== '0';

if (!projectRoot) {
  if (reportNoop) {
    emitAdditionalContext(`Codex project hook reached with Node.js ${nodeVersion}; skipped mLua LSP start because no RootDesk was found from ${input.cwd || process.cwd()}.`);
  }
  process.exit(0);
}

const cmd = resolveMluaCommand();
const args = splitArgs(process.env.MLUA_LSP_ARGS).concat(['start', projectRoot]);
const timeout = Number.parseInt(process.env.MLUA_LSP_HOOK_START_TIMEOUT_MS || '120000', 10);

const result = spawnSync(cmd, args, {
  encoding: 'utf8',
  shell: process.platform === 'win32',
  timeout: Number.isFinite(timeout) ? timeout : 120000,
  windowsHide: true,
});

if (result.error || result.status !== 0) {
  const message = result.error?.message || result.stderr || `exit ${result.status}`;
  emitAdditionalContext(`Codex project hook reached with Node.js ${nodeVersion}, but mLua LSP daemon start failed. Ask the AI agent to install/fix mlua-lsp, or install Node.js from https://nodejs.org/ and then run npm install -g @maplestoryworlds/mlua-lsp. Detail: ${String(message).trim()}`);
  process.exit(0);
}

if (reportStart) {
  emitAdditionalContext(`Codex project hook reached with Node.js ${nodeVersion}; mLua LSP daemon is ready for ${projectRoot}.`);
}
