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
