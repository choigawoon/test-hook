# Cursor hook smoke test

This project-level Cursor hook lives in `.cursor/hooks.json` and runs on
`sessionStart`.

Expected smoke output when the project is not an MSW project:

```json
{
  "continue": true,
  "permission": "allow",
  "agent_message": "Cursor project hook reached with Node.js <version>; skipped mLua LSP start because no RootDesk was found from <cwd>."
}
```

Expected output when Cursor is opened inside an MSW project with `RootDesk`:

```json
{
  "continue": true,
  "permission": "allow",
  "agent_message": "Cursor project hook reached with Node.js <version>; mLua LSP daemon is ready for <project>."
}
```

If the hook does not appear to run, restart Cursor and check `View -> Output`
then select `Hooks`.

## Verification Log

### 2026-05-01 15:29 UTC

Project: `/Users/choigawoon/ai-agent-tf/test-codex`

Result: Cursor loaded one project hook for `sessionStart`, executed
`node .cursor/hooks/mlua-session-start.js`, received valid JSON, and merged
one valid response.

Observed output:

```text
Cursor project hook reached with Node.js v22.22.0; skipped mLua LSP start because no RootDesk was found from /Users/choigawoon/ai-agent-tf/test-codex.
```

Interpretation: project-level Cursor hook works. The mLua daemon start was
correctly skipped because this repository is not an MSW project.

### 2026-05-01 15:31 UTC

Project: `/Users/choigawoon/ai-agent-tf/DefaultTilemap`

Result: Cursor found two `sessionStart` hooks: one from `.cursor/hooks.json`
and one from the Claude project config. The Cursor project hook executed
successfully, returned valid JSON, and started the mLua LSP daemon.

Observed output:

```text
Cursor project hook reached with Node.js v22.22.0; mLua LSP daemon is ready for /Users/choigawoon/ai-agent-tf/DefaultTilemap.
```

Interpretation: the same Cursor hook works in an MSW project and reaches the
daemon-ready path. Cursor may also load `.claude` project hooks, so projects
that contain both `.cursor` and `.claude` session hooks can run both.
