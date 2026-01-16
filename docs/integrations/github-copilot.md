# GitHub Copilot

Setup SkillKit with GitHub Copilot in VS Code.

> **Recommended model:** Select Claude Sonnet 4.5 or Claude Opus 4.5 in Copilot's model picker. These models reliably discover and follow skill instructions.

## Configuration

Add to VS Code settings (`Cmd/Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"):

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": ["skillkit-mcp"]
      }
    }
  }
}
```

Reload VS Code after adding the configuration.

## With Custom Skill Paths

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": ["skillkit-mcp", "--skills-path", "~/my-skills"]
      }
    }
  }
}
```

## With Git Repository

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git#main"]
      }
    }
  }
}
```

## Automatic Skill Usage

To avoid adding "use skillkit" to every prompt, create `.github/copilot-instructions.md` in your project:

```markdown
Use skillkit for working with skills.
```

Or add to your user-level instructions in VS Code settings.

## Verify Setup

1. Open Copilot Chat
2. Ask: `What skillkit tools are available?`
3. Copilot should list the SkillKit tools

## Troubleshooting

### Tools not appearing

- Ensure MCP is enabled in VS Code (may require Copilot extension update)
- Reload VS Code after configuration changes
- Check VS Code output panel for MCP errors

### npx not found

Specify the full path to npx:

```json
{
  "command": "/usr/local/bin/npx",
  "args": ["skillkit-mcp"]
}
```

Or use node directly:

```json
{
  "command": "node",
  "args": ["/path/to/skillkit-mcp/dist/cli.js"]
}
```
