# DevSkills

Reusable AI coding agent skills, exposed via MCP. Define workflows once, use across Claude Code, Cursor, GitHub Copilot, and other MCP-compatible tools.

## Why Skills?

AI coding agents are powerful but generic. They don't know your team's conventions, deployment processes, or domain-specific patterns. Every time you ask for help, you repeat the same context.

**Skills solve this by packaging reusable knowledge:**

- **Consistency** - The same workflow runs the same way every time, across any MCP-compatible agent
- **Efficiency** - Stop re-explaining your PR review checklist, deployment steps, or coding standards
- **Shareability** - Create once, use across your team and tools
- **Progressive loading** - Only load what's needed: metadata first, then instructions, then scripts/references

## Quick Start

### For Teams (Recommended)

Initialize a team skills repository with pre-configured MCP settings:

```bash
uvx devskills init my-team-skills
cd my-team-skills
git init && git add . && git commit -m "Initial commit"
```

This creates:
```
my-team-skills/
├── skills/                  # Your custom skills go here
├── .claude/mcp.json         # Pre-configured for Claude Code
├── .vscode/mcp.json         # Pre-configured for GitHub Copilot
├── .cursor/mcp.json         # Pre-configured for Cursor
├── .gitignore
└── README.md
```

The generated MCP configs already include `--skills-path ./skills`:
```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
```

Create your first skill:
```bash
uvx devskills init-skill code-review --path ./skills
```

Team members clone the repo, and their agents automatically get access to team skills plus bundled defaults.

### Manual Setup

If you want to add devskills to an existing project manually:

**Claude Code** (`.claude/mcp.json`):
```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
```

**GitHub Copilot** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "devskills": {
      "type": "stdio",
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
```

> **Note:** Without `--skills-path`, only bundled skills are available. Add `--skills-path ./skills` to include your custom skills.

## How It Works

```
┌─────────────────────────────────────────┐
│     devskills (PyPI package)            │
│  ├── bundled_skills/                    │
│  │   ├── example/                       │
│  │   ├── skill-creator/                 │
│  │   └── mcp-builder/                   │
│  └── MCP server                         │
└─────────────────────────────────────────┘
           │
           │  --skills-path ./skills
           ▼
┌─────────────────────────────────────────┐
│     Your Team's Skills Repo             │
│  └── skills/                            │
│      ├── code-review/                   │
│      ├── deployment/                    │
│      └── ...                            │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│     AI Agents (via MCP)                 │
│  Claude Code, Cursor, GitHub Copilot    │
└─────────────────────────────────────────┘
```

## CLI Usage

```bash
# Run MCP server (default)
uvx devskills
uvx devskills --skills-path ./skills
uvx devskills --skills-path ./skills --no-bundled

# Initialize a team skills repository
uvx devskills init my-team-skills
uvx devskills init ./path -n "My Team"

# Create a new skill from template
uvx devskills init-skill code-review
uvx devskills init-skill deployment --path ./skills

# Show version
uvx devskills --version
```

## MCP Tools

The server exposes five tools:

| Tool | Description |
|------|-------------|
| `list_skills()` | Lists all available skills with name and description |
| `get_skill(name)` | Retrieves full SKILL.md content for a skill |
| `get_script(skill, filename)` | Gets a script from a skill's `scripts/` folder |
| `get_reference(skill, filename)` | Gets a reference doc from a skill's `references/` folder |
| `get_skill_paths()` | Returns configured skill directories (for creating new skills) |

## Creating Skills

Use the built-in `skill-creator` skill:
```
I want to create a new skill for code review. Use devskills.
```

See [Creating Skills](docs/creating-skills.md) for the full guide.

## Bundled Skills

| Skill | Description |
|-------|-------------|
| `example` | Test skill to verify devskills is working |
| `skill-creator` | Guides you through creating new skills |
| `mcp-builder` | Best practices for building MCP servers |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEVSKILLS_SKILLS_PATH` | Colon-separated list of skill directories |
| `DEVSKILLS_LOCAL_SKILLS` | (Deprecated) Use `DEVSKILLS_SKILLS_PATH` instead |

## Development

```bash
# Clone and install
git clone https://github.com/kontext-e/devskills.git
cd devskills
uv sync

# Run locally
uv run devskills --skills-path ./test-skills

# Run tests
uv run pytest
```

## License

MIT
