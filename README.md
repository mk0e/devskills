# DevSkills

Central repo for reusable AI coding agent skills, exposed via MCP. Define workflows once, use across Claude Code, Cursor, GitHub Copilot, and other MCP-compatible tools.

## What Are Skills?

Skills are reusable instruction sets that tell AI agents how to accomplish specific tasks. A skill bundles:

- **Instructions** (SKILL.md) - what to do, when to use it
- **Scripts** - pre-built utilities the agent can run
- **Reference docs** - reference material loaded on demand

Example: a `code-review` skill contains instructions for reviewing PRs, a Python script for static analysis, and a patterns doc explaining what to flag.

## How It Works

```
┌─────────────────────────────────────────┐
│         This Repository                 │
│              /skills                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│          Local MCP Server               │
│   python -m server (stdio transport)    │
│                                         │
│   Tools: list_skills, get_skill,        │
│          get_script, get_reference      │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Claude Code   Cursor    GitHub Copilot
```

The MCP server delivers skill content. Agents execute scripts in their own environment.

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/devskills.git
cd devskills
uv sync  # or: pip install -e .
```

### 2. Configure Your Agent

**Claude Code:**
```bash
claude mcp add devskills \
  --transport stdio \
  -- uv run --directory /path/to/devskills python -m server
```

**Cursor** (add to `~/.cursor/mcp.json`):
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

**GitHub Copilot** (add to `.vscode/mcp.json`):
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

### 3. Use Skills

Ask your agent to use skills:
```
Review this code. Use devskills.
```

Or add to your agent's instructions (CLAUDE.md, .cursorrules, etc.):
```markdown
Before implementation tasks, call list_skills() from devskills MCP.
If a relevant skill exists, fetch it with get_skill(name) and follow its instructions.
```

## Creating Skills

Use the `skill-creator` skill to create new skills:

```
I want to create a new skill. Use devskills.
```

Or manually create a skill directory:

```
skills/my-skill/
├── SKILL.md           # Required: instructions with YAML frontmatter
├── scripts/           # Optional: executable scripts
└── references/        # Optional: reference documentation
```

Example `SKILL.md`:
```yaml
---
name: my-skill
description: Brief description shown in list_skills()
---

## When to Use
Describe when this skill applies.

## Instructions
1. Step one
2. Run `scripts/analyze.py` on target files
3. See `references/patterns.md` for guidelines
```

## Project-Local Skills

Add project-specific skills in `.devskills/skills/`:

```
my-project/
├── .devskills/
│   └── skills/
│       └── deploy/
│           └── SKILL.md
└── src/
```

Configure with `DEVSKILLS_LOCAL_SKILLS` env var:

```bash
claude mcp add devskills \
  --transport stdio \
  --env DEVSKILLS_LOCAL_SKILLS="./.devskills/skills" \
  -- uv run --directory /path/to/devskills python -m server
```

Local skills override repo skills with the same name.

## Repository Structure

```
devskills/
├── skills/           # Skill definitions
│   ├── example/      # Example skill for testing
│   └── skill-creator/# Skill for creating new skills
├── server/           # Python MCP server
└── plan/             # Implementation plans
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `list_skills()` | List all skills with name and description |
| `get_skill(name)` | Get SKILL.md content |
| `get_script(skill, filename)` | Get script content |
| `get_reference(skill, filename)` | Get reference document |
