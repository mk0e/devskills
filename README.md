# DevSkills

[![PyPI](https://img.shields.io/pypi/v/devskills)](https://pypi.org/project/devskills/)

An MCP server that brings [Anthropic's Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) to any MCP-compatible coding agent.

**What this enables:** Your team creates a shared repository of skills — development workflows, code reviews,debugging, etc.— and every team member's AI agent (Claude Code, Cursor, Copilot) can use them automatically.

- [What are Skills?](#what-are-skills)
- [The Problem](#the-problem)
- [How DevSkills Works](#how-devskills-works)
- [Quick Start](#quick-start)
- [Creating Skills](#creating-skills)
- [Documentation](#documentation)


## What are Skills?

Skills are Anthropic's concept for giving AI agents specialized knowledge. Instead of repeating context every conversation, you package instructions, scripts, and references into a folder that agents load on-demand.

Think of skills like onboarding docs for a new hire: "Here's how we do deployments. Here's our code review checklist. Here's the security patterns we follow." Except the new hire is an AI agent.

The key design principle is **progressive disclosure** — agents see only skill names and descriptions upfront, then load full instructions only when relevant. This means you can have dozens of skills without bloating context.

## The Problem

Native Skills support exists only in Claude Code, where skills live in `~/.claude/skills/` or `.claude/skills/`.

Teams using Cursor, GitHub Copilot, or other AI coding tools can't use Skills and can't share a common skill repository across different tools and maybe even agents running on the server side.

## How DevSkills Works

DevSkills runs as an MCP server that exposes your skills to any MCP-compatible agent:

```
┌─────────────────────────────────────────┐
│     devskills (MCP Server)              │
│  ├── bundled_skills/  (defaults)        │
│  └── your skills via --skills-path      │
└─────────────────────────────────────────┘
                    │
                    │ MCP Protocol
                    ▼
┌─────────────────────────────────────────┐
│     AI Coding Agents                    │
│  Claude Code, Cursor, GitHub Copilot    │
└─────────────────────────────────────────┘
```

**How agents use skills:**

1. **Discovery** — Agent calls `list_skills()`, sees names and descriptions
2. **Selection** — Agent decides which skill matches the user's request
3. **Loading** — Agent calls `get_skill(name)` to load full instructions
4. **Execution** — Agent follows the instructions, optionally fetching scripts or references

This mirrors Anthropic's progressive disclosure: metadata first, full content only when needed.

**Team workflow:**

1. Team creates a skills repository (manually or via `devskills init`)
2. Each developer clones the repo locally
3. Each developer configures their MCP client to point to the local checkout:

```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "/path/to/team-skills"]
    }
  }
}
```

Same skills, any agent.

## Quick Start

### 1. Create a Skills Repository

```bash
uvx devskills init my-team-skills
cd my-team-skills
git init && git add . && git commit -m "Initial commit"
```

### 2. Configure Your MCP Client

Add devskills to your agent's MCP config, pointing to your skills:

```json
{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "/path/to/my-team-skills/skills"]
    }
  }
}
```

See [Setup Guide](docs/setup.md) for agent-specific configuration (Claude Code, Cursor, GitHub Copilot).

## Creating Skills

The recommended way to create a skill is using the built-in `skill-creator`:

```
I want to create a new skill for code review. Use devskills.
```

This guides you through creating a skill with the correct structure.

See [Creating Skills](docs/creating-skills.md) for the full guide, including skill structure and SKILL.md format.

## Documentation

- [Setup Guide](docs/setup.md) — Agent-specific MCP configuration
- [Creating Skills](docs/creating-skills.md) — Skill structure and format
- [Reference](docs/reference.md) — CLI, MCP tools, bundled skills
- [Contributing](CONTRIBUTING.md) — Development setup

**Anthropic Resources:**
- [Agent Skills Blog Post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
