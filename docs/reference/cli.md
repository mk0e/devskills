# CLI Reference

## Server

Start the MCP server:

```bash
skillkit-mcp [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-s, --skills-path <paths...>` | Skill directories or git URLs |
| `--no-bundled` | Disable bundled skills |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

### Examples

```bash
# Default: uses ~/.skillkit/ and bundled skills
skillkit-mcp

# Custom local path
skillkit-mcp --skills-path ~/my-skills

# Git repository
skillkit-mcp --skills-path git@github.com:org/skills.git

# Git with version pin
skillkit-mcp --skills-path git@github.com:org/skills.git#v1.0

# Multiple sources
skillkit-mcp --skills-path ~/personal --skills-path git@github.com:team/skills.git

# Disable bundled skills
skillkit-mcp --no-bundled --skills-path ~/my-skills
```

### Path Behavior

- **No paths specified**: Uses `~/.skillkit/` + bundled skills
- **Paths specified**: Uses only those paths + bundled skills (default `~/.skillkit/` excluded)

## init

Initialize a new skills repository:

```bash
skillkit-mcp init [path]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `path` | Directory to initialize | Current directory |

### Examples

```bash
# Initialize in new directory
skillkit-mcp init ~/team-skills

# Initialize in current directory
skillkit-mcp init .
```

### Created Structure

```
my-skills/
├── skills/
├── prompts/
├── README.md
└── .gitignore
```

## init-skill

Create a new skill from template:

```bash
skillkit-mcp init-skill <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Skill name (hyphen-case) |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path <path>` | Skills directory | `./skills` |

### Examples

```bash
# Create in default location
skillkit-mcp init-skill code-review

# Create in specific directory
skillkit-mcp init-skill code-review --path ~/team-skills/skills
```

### Naming Rules

- Hyphen-case: `code-review`, `api-docs`
- 1-64 characters
- Must start with a letter
- Allowed: letters, numbers, hyphens

## validate

Validate skills and prompts:

```bash
skillkit-mcp validate [path] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `path` | Directory to validate | Current directory |

### Options

| Option | Description |
|--------|-------------|
| `--skills-only` | Only validate skills |
| `--prompts-only` | Only validate prompts |

### Examples

```bash
# Validate current directory
skillkit-mcp validate

# Validate specific directory
skillkit-mcp validate ~/team-skills

# Skills only
skillkit-mcp validate --skills-only
```

### Validation Checks

**Skills:**
- SKILL.md exists
- Valid YAML frontmatter
- Required fields: `name`, `description`
- Name follows naming rules
- Description under 1024 characters

**Prompts:**
- Valid YAML frontmatter
- Required fields: `name`, `description`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKILLKIT_SKILLS_PATH` | Colon-separated list of skill paths |
| `SKILLKIT_HOME` | Custom home directory (default: `~/.skillkit`) |

### Example

```bash
export SKILLKIT_SKILLS_PATH="~/personal:~/team-skills"
skillkit-mcp
```
