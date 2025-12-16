# DevSkills

An MCP server that brings [Anthropic's Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) concept to any AI coding agent. Skills are reusable knowledge packages that teach AI agents how to perform specific tasks consistently.

DevSkills extends the original concept with:
- **MCP compatibility** - Works with any MCP-enabled agent (GitHub Copilot, Cursor, Claude Code)
- **Git-based sharing** - Share skills via git repositories across your team
- **Multi-repo support** - Connect to multiple skill repositories simultaneously
- **Skills as prompts** - Expose skills as user-triggered slash commands

## Quick Start

The npm package isn't published yet. Follow these steps to run the development version.

### 1. Clone and Install

```bash
git clone https://github.com/your-org/devskills-ts.git
cd devskills-ts
pnpm install
```

### 2. Initialize a Skills Repository

Create a repository to store your team's skills:

```bash
# Create and initialize a skills repo
pnpm init:repo ~/my-team-skills

# Or in an existing directory
cd ~/my-team-skills && pnpm --prefix /path/to/devskills-ts init:repo .
```

This creates:
```
my-team-skills/
├── skills/       # Your skills go here
├── prompts/      # User-triggered prompts
├── README.md
└── .gitignore
```

### 3. Configure Your AI Agent

#### GitHub Copilot (VS Code)

Add to your VS Code settings (`.vscode/settings.json` or user settings):

```json
{
  "mcp": {
    "servers": {
      "devskills": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "tsx",
          "/absolute/path/to/devskills-ts/src/cli.ts",
          "--skills-path",
          "/absolute/path/to/my-team-skills/skills"
        ],
        "cwd": "/absolute/path/to/devskills-ts"
      }
    }
  }
}
```

#### Future MCP Configuration

Once the package is published to npm:

```json
{
  "mcp": {
    "servers": {
      "devskills": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "devskills",
          "--skills-path",
          "/path/to/skills"
        ]
      }
    }
  }
}
```

> **Note:** The npm package isn't published yet. Use the development configuration above for now.

### 4. Create Your First Skill

Ask your AI agent to create a skill:

```
I want to create a new skill for [your use case]. Use devskills.
```

The agent will use the bundled `skill-creator` skill to guide you through the process interactively - asking about your workflow, generating the directory structure, and writing the SKILL.md file.

**Alternative:** Use the CLI to scaffold a skill manually:

```bash
pnpm init:skill my-first-skill --path ~/my-team-skills/skills
```

## How to Use

Once configured, mention "use devskills" in your prompt to trigger skill lookup:

```
Help me create a new skill for our deployment workflow. Use devskills.
```

The agent will:
1. Call `devskills_list_skills()` to discover available skills
2. Match your request to a skill description
3. Call `devskills_get_skill()` to load the full instructions
4. Follow the skill's guidance to complete your task

**Example prompts:**

```
I need to [task]. Use devskills.
```

```
Use devskills to help me with [task].
```

If you've created a prompt for a skill, you can also invoke it directly as a slash command (e.g., `/code-review`).

## Core Concepts

### Skills

Skills are directories containing a `SKILL.md` file with instructions for the AI agent. They can include scripts and reference documents. The agent discovers and loads skills automatically based on the task at hand.

### Prompts

Prompts are user-triggered entry points (like slash commands) that explicitly invoke skills. Not every skill needs a prompt - only workflows you want users to trigger directly.

See [docs/concepts.md](docs/concepts.md) for details.

## CLI Reference

| pnpm Script | Command | Description |
|-------------|---------|-------------|
| `pnpm start` | `devskills` | Start the MCP server |
| `pnpm init:repo [path]` | `devskills init` | Initialize a skills repository |
| `pnpm init:skill <name>` | `devskills init-skill` | Create a new skill from template |
| `pnpm validate <path>` | `devskills validate-skill` | Validate a skill directory |

### Server Options

```bash
pnpm start -- --skills-path <paths...>  # Additional skills directories
pnpm start -- --no-bundled              # Disable bundled default skills
```

## Documentation

- [Concepts: Skills vs Prompts](docs/concepts.md)
- [Creating Skills](docs/creating-skills.md)
- [Configuration Guide](docs/configuration.md)
- [How It Works](docs/how-it-works.md)

## Development

```bash
pnpm install
pnpm build
pnpm test
```