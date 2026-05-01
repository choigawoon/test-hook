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
