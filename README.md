# SkillKit

> Share AI skills across your team and tools

SkillKit is an MCP server for sharing [AI agent skills](https://agentskills.io). Connect any MCP-compatible agent and start creating skills immediately.

> **Recommended model:** SkillKit is tested with the Claude 4.5 family (Sonnet, Opus). These models reliably discover and follow skill instructions.

## Quick Start

### 1. Install

Add SkillKit to your MCP configuration. Example for GitHub Copilot (VS Code settings):

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

### 2. Use

Add `use skillkit` to your prompt:

```
Create a skill for reviewing code. use skillkit
```

> **Tip:** To avoid adding "use skillkit" to every prompt, add this to your custom instructions (e.g., `.github/copilot-instructions.md`):
> ```
> Use skillkit for working with skills.
> ```

### 3. Create and Use Skills

```
Create a skill for reviewing PRs according to our team standards. use skillkit
```

The bundled `skill-creator` guides you through the process. Skills are saved to `~/.skillkit/skills/` by default.

Then use your skill:

```
Review this PR for issues. use skillkit
```

## Team Sharing

Personal skills live in `~/.skillkit/`. To share with your team, create a dedicated skills repository:

```bash
npx skillkit-mcp init ~/team-skills
cd ~/team-skills && git init && git remote add origin git@github.com:your-org/skills.git
```

Then configure SkillKit with `--skills-path`. You can point to:

**A local folder** (your checked-out repo):
```json
{ "args": ["skillkit-mcp", "--skills-path", "~/team-skills"] }
```

**A git URL** (cloned automatically):
```json
{ "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git#main"] }
```

Git URLs support version pinning with `#branch`, `#tag`, or `#commit`.

## Features

- **Zero config** - Works immediately with `~/.skillkit/` as default location
- **Git-native** - Share via git repos, version with tags, collaborate via PRs
- **Remote repos** - Point to git URLs with version pinning (`repo.git#v1.0`)
- **Any MCP agent** - Works with coding agents and general-purpose agent frameworks

## Use Cases

### Coding Agents

GitHub Copilot and other MCP-compatible coding agents can use SkillKit to access team skills.

### General-Purpose Agents

Agent frameworks like LangChain, AWS Strands, or custom implementations can integrate SkillKit via MCP to add skill capabilities:

```python
# Example: AWS Strands with MCP
from strands import Agent
from strands.tools.mcp import MCPClient

mcp = MCPClient(["npx", "skillkit-mcp"])
agent = Agent(tools=[mcp])
# Agent now has access to skillkit_list_skills, skillkit_get_skill, etc.
```

See [Custom Agents](docs/integrations/custom-agents.md) for integration examples.

## Documentation

- [Getting Started](docs/getting-started/) - Installation and quick start
- [Guide](docs/guide/) - Creating skills, scripts, references
- [Integrations](docs/integrations/) - Setup for different agents
- [Reference](docs/reference/) - CLI and file formats

## CLI

```bash
skillkit-mcp                     # Start server
skillkit-mcp --skills-path <p>   # Use specific paths
skillkit-mcp init [path]         # Initialize a skills repository
skillkit-mcp init-skill <name>   # Create a new skill
skillkit-mcp validate [path]     # Validate skills and prompts
```

## License

MIT
