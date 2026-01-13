# SkillKit

An MCP server that brings [Anthropic's Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) concept to any AI coding agent. Skills are reusable knowledge packages that teach AI agents how to perform specific tasks consistently.

SkillKit extends the original concept with:
- **MCP compatibility** - Works with any MCP-enabled agent (GitHub Copilot, Cursor, Claude Code)
- **Git-based sharing** - Share skills via git repositories across your team
- **Multi-repo support** - Connect to multiple skill repositories simultaneously
- **Skills as prompts** - Expose skills as user-triggered slash commands

## Quick Start

### 1. Install

```bash
npm install -g skillkit-mcp
# or use directly with npx
npx skillkit-mcp --help
```

### 2. Initialize a Skills Repository

Create a repository to store your team's skills:

```bash
# Create and initialize a skills repo
npx skillkit-mcp init ~/my-team-skills

# Or in an existing directory
cd ~/my-team-skills && npx skillkit-mcp init .
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
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "skillkit-mcp",
          "--skills-path",
          "/path/to/my-team-skills"
        ]
      }
    }
  }
}
```

#### Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "skillkit": {
      "command": "npx",
      "args": ["skillkit-mcp", "--skills-path", "/path/to/skills"]
    }
  }
}
```

### 4. Create Your First Skill

Ask your AI agent to create a skill:

```
I want to create a new skill for [your use case]. Use skillkit.
```

The agent will use the bundled `skill-creator` skill to guide you through the process interactively - asking about your workflow, generating the directory structure, and writing the SKILL.md file.

**Alternative:** Use the CLI to scaffold a skill manually:

```bash
npx skillkit-mcp init-skill my-first-skill --path ~/my-team-skills/skills
```

## How to Use

Once configured, mention "use skillkit" in your prompt to trigger skill lookup:

```
Help me create a new skill for our deployment workflow. Use skillkit.
```

The agent will:
1. Call `skillkit_list_skills()` to discover available skills
2. Match your request to a skill description
3. Call `skillkit_get_skill()` to load the full instructions
4. Follow the skill's guidance to complete your task

**Example prompts:**

```
I need to [task]. Use skillkit.
```

```
Use skillkit to help me with [task].
```

If you've created a prompt for a skill, you can also invoke it directly as a slash command (e.g., `/code-review`).

## Core Concepts

### Skills

Skills are directories containing a `SKILL.md` file with instructions for the AI agent. They can include scripts and reference documents. The agent discovers and loads skills automatically based on the task at hand.

### Prompts

Prompts are user-triggered entry points (like slash commands) that explicitly invoke skills. Not every skill needs a prompt - only workflows you want users to trigger directly.

See [docs/concepts.md](docs/concepts.md) for details.

## CLI Reference

| Command | Description |
|---------|-------------|
| `skillkit-mcp` | Start the MCP server |
| `skillkit-mcp init [path]` | Initialize a skills repository |
| `skillkit-mcp init-skill <name>` | Create a new skill from template |
| `skillkit-mcp validate <path>` | Validate skills and prompts |

### Server Options

```bash
skillkit-mcp --skills-path <paths...>  # Additional skills directories
skillkit-mcp --no-bundled              # Disable bundled default skills
```

## Documentation

- [Concepts: Skills vs Prompts](docs/concepts.md)
- [Creating Skills](docs/creating-skills.md)
- [Configuration Guide](docs/configuration.md)
- [How It Works](docs/how-it-works.md)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Always create a Pull Request** - Direct commits to `main` are not allowed
2. **Use descriptive PR titles** - They appear in auto-generated release notes
3. **Add appropriate labels** - Help categorize changes in releases:
   - `enhancement` / `feature` - New features
   - `bug` / `fix` - Bug fixes
   - `documentation` - Docs changes
   - `breaking-change` - Breaking changes

### Development Setup

```bash
git clone https://github.com/mk0e/skillkit-mcp.git
cd skillkit-mcp
pnpm install
pnpm build
pnpm test
```

### First-Time Setup (Maintainers)

1. **Publish manually once** to create the package:
   ```bash
   npm login
   pnpm build && pnpm test
   pnpm publish --access public
   ```

2. **Configure Trusted Publishers** on npm:
   - Go to https://www.npmjs.com/package/skillkit-mcp/access
   - Add trusted publisher: owner `mk0e`, repo `skillkit-mcp`, workflow `publish.yml`

3. **Configure branch protection** on GitHub:
   - Go to repository Settings > Branches
   - Add rule for `main`: require PR, require status checks (select "test")

### Release Process

1. Create feature branch: `git checkout -b feature/my-change`
2. Make changes and commit
3. Push and create PR with descriptive title + labels
4. Merge PR after CI passes
5. When ready to release:
   - Update version in `package.json`
   - Commit: `git commit -m "chore: release vX.Y.Z"`
   - Push to main
   - Go to GitHub Releases and create a new release
   - Click "Generate release notes" for auto-categorized changelog
   - Publish release - npm package publishes automatically via OIDC
