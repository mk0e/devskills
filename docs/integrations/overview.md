# Integrations Overview

SkillKit works with any AI agent that supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

## How It Works

SkillKit runs as an MCP server that exposes skills as tools:

```
┌─────────────────┐
│    AI Agent     │
│ (Copilot, etc.) │
└────────┬────────┘
         │ MCP (stdio)
         ▼
┌─────────────────┐
│ SkillKit Server │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
Skills    Prompts
```

The agent calls SkillKit tools to:
1. List available skills
2. Get skill instructions
3. Fetch scripts and references

## Supported Agents

| Agent Type | Examples | Guide |
|------------|----------|-------|
| **Coding agents** | GitHub Copilot | [Setup](github-copilot.md) |
| **Custom agents** | LangChain, AWS Strands | [Setup](custom-agents.md) |

Any MCP-compatible agent can use SkillKit.

## Basic Configuration

All agents use a similar JSON configuration:

```json
{
  "skillkit": {
    "command": "npx",
    "args": ["skillkit-mcp"]
  }
}
```

With custom skill paths:

```json
{
  "skillkit": {
    "command": "npx",
    "args": ["skillkit-mcp", "--skills-path", "~/my-skills"]
  }
}
```

The exact format varies by agent. See the specific guide for details.

## Telling the Agent to Use SkillKit

SkillKit tools are available, but the agent needs to know when to use them.

**Option 1: Add to prompts**

```
Review this code. use skillkit
```

**Option 2: Add to agent instructions**

Add this to your agent's instruction file (e.g., `.github/copilot-instructions.md` for Copilot):

```
Use skillkit for working with skills.
```

## Troubleshooting

### SkillKit tools not appearing

1. Check that the MCP configuration is correct
2. Restart the agent after configuration changes
3. Verify SkillKit starts: `npx skillkit-mcp --help`

### Skills not loading

1. Check skill path exists: `ls ~/.skillkit/skills/`
2. Validate skills: `npx skillkit-mcp validate`
3. Check for SKILL.md in each skill folder

### Agent not using skills

1. Add "use skillkit" to your prompt
2. Or add to agent instructions (see above)
