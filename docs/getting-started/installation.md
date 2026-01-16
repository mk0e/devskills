# Installation

## Requirements

- **Node.js** 18 or later
- **npm** or **pnpm**
- **Git** (optional, for remote repository support)

## Install

### Global Installation

```bash
npm install -g skillkit-mcp
```

Verify the installation:

```bash
skillkit-mcp --version
```

### Using npx (No Installation)

Run directly without installing:

```bash
npx skillkit-mcp --help
```

This is useful for trying SkillKit or for CI/CD environments.

## Verify It Works

Check that the server starts:

```bash
npx skillkit-mcp --help
```

You should see:

```
Usage: skillkit-mcp [options] [command]

MCP server for AI agent skills

Options:
  -s, --skills-path <paths...>  Path(s) to skills directories or git URLs
  --no-bundled                  Disable bundled skills
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  init [options] [path]         Initialize a new skills repository
  init-skill [options] <name>   Create a new skill from template
  validate [options] [path]     Validate skills and prompts
  help [command]                display help for command
```

## Git Support (Optional)

For remote git repository support, ensure Git is installed:

```bash
git --version
```

SkillKit uses git to clone remote skill repositories. If git isn't installed, you can still use local skill folders.

## What's Next

- [Quick Start](quick-start.md) - Create and use your first skill
- [Integrations](../integrations/overview.md) - Connect to your AI agent
