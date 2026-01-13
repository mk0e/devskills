# Configuration

This guide covers how to configure SkillKit for different AI agents and setups.

## CLI Options

### Running the Server

```bash
skillkit-mcp [options]
```

| Option | Description |
|--------|-------------|
| `-s, --skills-path <paths...>` | Additional skills directories (can be specified multiple times) |
| `--no-bundled` | Disable bundled default skills |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

**Examples:**

```bash
# Run with bundled skills only
skillkit-mcp

# Add a single skills directory
skillkit-mcp --skills-path ./my-skills

# Add multiple directories
skillkit-mcp --skills-path ./team-skills --skills-path ./personal-skills

# Disable bundled skills
skillkit-mcp --skills-path ./my-skills --no-bundled
```

### Other Commands

```bash
# Initialize a skills repository
skillkit-mcp init [path] [-n, --name <name>] [-f, --force]

# Create a new skill
skillkit-mcp init-skill <skillName> [-p, --path <path>]

# Validate a skill
skillkit-mcp validate-skill <skillPath>
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKILLKIT_SKILLS_PATH` | Colon-separated list of skills directories |

**Example:**

```bash
export SKILLKIT_SKILLS_PATH="/path/to/team-skills:/path/to/personal-skills"
skillkit-mcp
```

## Path Priority

When the same skill name exists in multiple locations, higher-priority paths override lower ones:

1. **CLI arguments** (`--skills-path`) - Highest priority
2. **Environment variable** (`SKILLKIT_SKILLS_PATH`)
3. **Bundled skills** - Lowest priority

This allows you to override bundled skills with custom versions.

## Multi-Repository Setup

Connect multiple skill repositories by specifying multiple paths:

```bash
skillkit-mcp \
  --skills-path ~/work/team-skills/skills \
  --skills-path ~/personal/my-skills/skills \
  --skills-path ~/repos/open-source-skills/skills
```

Or via environment variable:

```bash
export SKILLKIT_SKILLS_PATH="~/work/team-skills/skills:~/personal/my-skills/skills"
```

**Note:** Paths support tilde expansion (`~`) for home directories.

## AI Agent Configuration

### GitHub Copilot (VS Code)

Add to your VS Code settings (`.vscode/settings.json` or user settings):

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "tsx",
          "/absolute/path/to/skillkit-mcp/src/cli.ts",
          "--skills-path",
          "/absolute/path/to/team-skills/skills"
        ],
        "cwd": "/absolute/path/to/skillkit-mcp"
      }
    }
  }
}
```

**With multiple skill directories:**

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "tsx",
          "/absolute/path/to/skillkit-mcp/src/cli.ts",
          "--skills-path",
          "/path/to/team-skills/skills",
          "--skills-path",
          "/path/to/personal-skills/skills"
        ],
        "cwd": "/absolute/path/to/skillkit-mcp"
      }
    }
  }
}
```

**Using environment variables:**

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "tsx",
          "/absolute/path/to/skillkit-mcp/src/cli.ts"
        ],
        "cwd": "/absolute/path/to/skillkit-mcp",
        "env": {
          "SKILLKIT_SKILLS_PATH": "/path/to/skills"
        }
      }
    }
  }
}
```

> **Note:** The `cwd` field ensures npx uses the local tsx from node_modules for faster startup and version consistency.

#### Future MCP Configuration

Once the package is published to npm:

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
          "/path/to/skills"
        ]
      }
    }
  }
}
```

> **Tip:** This is the recommended configuration for production use.

### Claude Code

Add to your Claude Code MCP configuration (`.mcp.json` in your project or `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "skillkit": {
      "command": "npx",
      "args": [
        "tsx",
        "/path/to/skillkit-mcp/src/cli.ts",
        "--skills-path",
        "/path/to/skills"
      ],
      "cwd": "/path/to/skillkit-mcp"
    }
  }
}
```

### Cursor

Cursor uses the same MCP configuration format:

```json
{
  "mcpServers": {
    "skillkit": {
      "command": "npx",
      "args": [
        "tsx",
        "/path/to/skillkit-mcp/src/cli.ts",
        "--skills-path",
        "/path/to/skills"
      ],
      "cwd": "/path/to/skillkit-mcp"
    }
  }
}
```

## Skills Repository Structure

When pointing `--skills-path` to a directory, SkillKit expects this structure:

```
skills-directory/
├── skill-one/
│   ├── SKILL.md
│   ├── scripts/
│   └── references/
├── skill-two/
│   └── SKILL.md
└── ...
```

For prompts, SkillKit looks for a `prompts/` directory at the same level:

```
my-team-skills/
├── skills/          # Point --skills-path here
│   └── code-review/
└── prompts/         # Prompts discovered automatically
    └── code-review.md
```

## Disabling Bundled Skills

To use only your own skills without the bundled defaults:

```bash
skillkit-mcp --skills-path ./my-skills --no-bundled
```

Or in MCP configuration:

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "tsx",
          "/path/to/skillkit-mcp/src/cli.ts",
          "--skills-path",
          "/path/to/skills",
          "--no-bundled"
        ],
        "cwd": "/path/to/skillkit-mcp"
      }
    }
  }
}
```

## Troubleshooting

### Skills not appearing

1. Check the path is correct and contains skill directories
2. Each skill directory must have a `SKILL.md` file
3. Validate skills with `skillkit-mcp validate-skill <path>`

### Path issues

- Use absolute paths in MCP configurations
- Tilde expansion (`~`) works on the command line
- Environment variables are expanded

### Permission errors

Ensure the MCP client process has read access to skill directories.

## Next Steps

- [Creating Skills](creating-skills.md) - Author your own skills
- [How It Works](how-it-works.md) - Understand the server architecture
