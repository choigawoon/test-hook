# VS Code Copilot hook smoke test

VS Code Copilot agent hooks are in preview. This workspace hook lives in
`.github/hooks/vscode-session-start.json` and runs on `SessionStart`.

Official reference:

- https://code.visualstudio.com/docs/copilot/customization/hooks

Expected smoke output when this repository is not an MSW project:

```json
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "VS Code Copilot hook reached with Node.js <version>; skipped mLua LSP start because no RootDesk was found from <cwd>."
  }
}
```

Expected output when VS Code is opened inside an MSW project with `RootDesk`:

```json
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "VS Code Copilot hook reached with Node.js <version>; mLua LSP daemon is ready for <project>."
  }
}
```

To verify execution, open the Output panel and select
`GitHub Copilot Chat Hooks`.

Note: VS Code also loads `.claude/settings.json`,
`.claude/settings.local.json`, and `~/.claude/settings.json` by default.
This repository's `.vscode/settings.json` disables those Claude hook sources
for this workspace so this smoke test only exercises `.github/hooks`.
