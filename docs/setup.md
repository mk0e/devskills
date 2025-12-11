# Setup Guide

This guide covers how to configure devskills with different AI coding agents.

## Claude Code

Add the devskills MCP server to Claude Code:

```bash
claude mcp add devskills \
  --transport stdio \
  -- uv run --directory /path/to/devskills python -m server
```

Replace `/path/to/devskills` with the actual path to your cloned repo.

### Verify Installation

```bash
claude mcp list
```

You should see `devskills` in the list.

### Usage

Ask Claude to use skills explicitly:

```
Review this code. Use devskills.
```

Or add to your project's `CLAUDE.md` for automatic activation:

```markdown
Before implementation tasks, call list_skills() from the devskills MCP server.
If a relevant skill exists, fetch it with get_skill(name) and follow its instructions.
```

### Troubleshooting

Check server status in Claude Code:
```
/mcp
```

## GitHub Copilot (VS Code)

### Prerequisites

- VS Code 1.102 or later
- GitHub Copilot extension with MCP support

### Configuration

Create or edit `.vscode/mcp.json` in your project or user settings:

```json
{
  "servers": {
    "devskills": {
      "type": "stdio",
      "command": "uv",
      "args": ["run", "--directory", "/path/to/devskills", "python", "-m", "server"]
    }
  }
}
```

Replace `/path/to/devskills` with your actual path.

### Verify Installation

1. Open VS Code Command Palette (Cmd/Ctrl + Shift + P)
2. Run "GitHub Copilot: Show MCP Servers"
3. Verify `devskills` is listed and connected

### Usage

In Copilot Chat, reference skills:

```
@workspace Use devskills to review this code
```

## Cursor

Create or edit `.cursor/mcp.json` in your home directory (global) or project root (project-specific):

```json
{
  "mcpServers": {
    "devskills": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/devskills", "python", "-m", "server"]
    }
  }
}
```

Replace `/path/to/devskills` with your actual path.

### Verify Installation

1. Open Cursor Settings (Cmd/Ctrl + Shift + P -> "Cursor Settings")
2. Navigate to MCP section
3. Verify `devskills` appears and shows as connected

### Usage

In Cursor's agent mode, ask it to use skills:

```
List available skills from devskills and use code-review for this PR.
```
