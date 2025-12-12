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

### For Individual Use

Add devskills to your agent's MCP config. No installation needed - `uvx` handles everything.

**Claude Code** (`.claude/mcp.json`):
```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills"]
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
      "args": ["devskills"]
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
      "args": ["devskills"]
    }
  }
}
```

Then ask your agent:
```
I want to create a new skill. Use devskills.
```

### For Teams (Custom Skills)

Initialize a new team skills repository:

```bash
uvx devskills init my-team-skills
cd my-team-skills
git init && git add . && git commit -m "Initial commit"
```

This creates:
```
my-team-skills/
├── skills/
├── .claude/mcp.json
├── .vscode/mcp.json
├── .cursor/mcp.json
├── .gitignore
└── README.md
```

Then create your first skill:
```bash
uvx devskills init-skill code-review --path ./skills
```

Team members clone the repo, and their agents automatically get access to team skills plus bundled defaults.

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

## MCP Resources

Root-level reference documents in `references/` are exposed as MCP resources via `references://{filename}`.

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
