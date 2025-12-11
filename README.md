# DevSkills

Central repo for reusable AI coding agent skills, exposed via MCP. Define workflows once, use across Claude Code, Cursor, GitHub Copilot, and other MCP-compatible tools.

## Why Skills?

AI coding agents are powerful but generic. They don't know your team's conventions, deployment processes, or domain-specific patterns. Every time you ask for help, you repeat the same context.

**Skills solve this by packaging reusable knowledge:**

- **Consistency** - The same workflow runs the same way every time, across any MCP-compatible agent
- **Efficiency** - Stop re-explaining your PR review checklist, deployment steps, or coding standards
- **Shareability** - Create once, use across your team and tools
- **Progressive loading** - Only load what's needed: metadata first, then instructions, then scripts/references

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains (code review, deployment, migrations)
2. **Tool integrations** - Instructions for working with specific file formats, APIs, or services
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts and references for complex and repetitive tasks

### Example

A `code-review` skill might contain:
- **SKILL.md** - Instructions for reviewing PRs with your team's standards
- **scripts/analyze.py** - Static analysis script that flags common issues
- **references/patterns.md** - Document explaining what patterns to flag and why

When you say "Review this PR. Use devskills.", the agent loads the skill and follows your team's exact review process.

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

### Prerequisites

- [uv](https://docs.astral.sh/uv/) - Fast Python package manager

### 1. Clone and Install

```bash
git clone https://github.com/your-org/devskills.git
cd devskills
uv sync
```

### 2. Configure Your AI Coding Agent

See [Setup Guide](docs/setup.md) for detailed instructions for Claude Code, GitHub Copilot, and Cursor.

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

See [Creating Skills](docs/creating-skills.md) for the full guide.

**Quick start:** Use the built-in `skill-creator` skill:
```
I want to create a new skill for code review. Use devskills.
```

## MCP Tools

The server exposes four tools for skill discovery and retrieval:

### `list_skills()`

Returns all available skills with name and description. Call this first to discover what skills are available.

### `get_skill(name)`

Returns the full SKILL.md content for a skill. After fetching, follow the instructions in the returned content. If the skill references scripts or references, fetch them with the tools below.

### `get_script(skill, filename)`

Returns raw script content from a skill's `scripts/` folder. Only call when skill instructions explicitly reference a script. Execute the script locally following the skill's instructions.

### `get_reference(skill, filename)`

Returns reference documentation from a skill's `references/` folder. Only call when skill instructions explicitly reference a document.

## MCP Resources

Root-level reference documents in `references/` are exposed as MCP resources:

| Resource | Description |
|----------|-------------|
| `references://{filename}` | Get a root-level reference document |
