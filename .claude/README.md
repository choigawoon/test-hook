# Claude Code hook smoke test

This project-level Claude Code hook lives in `.claude/settings.json` and runs
on `SessionStart`.

Expected smoke output when this repository is not an MSW project:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Claude project hook reached with Node.js <version>; skipped mLua LSP start because no RootDesk was found from <cwd>."
  }
}
```

Expected output when Claude Code is opened inside an MSW project with
`RootDesk`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Claude project hook reached with Node.js <version>; mLua LSP daemon is ready for <project>."
  }
}
```

The daemon is started with `mlua-lsp start <project>`, which reuses an
existing per-project daemon when one is already running.

## Verification

Official Claude Code hook reference:

- https://code.claude.com/docs/en/hooks

Claude Code loads project hooks from `.claude/settings.json`. `SessionStart`
matchers filter how the session started (`startup`, `resume`, `clear`, or
`compact`). This project uses an empty matcher so the hook fires for every
`SessionStart` source.

Verified locally with:

```bash
claude --print --verbose --output-format stream-json --include-hook-events --debug hooks --setting-sources project "Reply OK only."
```

Observed hook event:

```json
{
  "type": "system",
  "subtype": "hook_started",
  "hook_name": "SessionStart:startup",
  "hook_event": "SessionStart"
}
```

Observed hook response:

```json
{
  "type": "system",
  "subtype": "hook_response",
  "hook_event": "SessionStart",
  "exit_code": 0,
  "outcome": "success"
}
```

In an interactive Claude session, `SessionStart` context is injected into the
conversation, but it is not necessarily displayed as a visible chat message.
Use `--include-hook-events` or `--debug hooks` to see the hook execution log.
