# How It Works

This document explains the SkillKit MCP server architecture and the tools it exposes.

## Architecture Overview

SkillKit is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes skills and prompts to AI coding agents. It runs as a stdio-based service, communicating with MCP clients through standard input/output.

```
┌─────────────────┐     stdio      ┌──────────────────┐
│  AI Agent       │ ◄────────────► │  SkillKit       │
│  (Copilot, etc) │                │  MCP Server      │
└─────────────────┘                └────────┬─────────┘
                                            │
                                   ┌────────┴─────────┐
                                   │                  │
                              ┌────▼────┐       ┌─────▼────┐
                              │ Skills  │       │ Prompts  │
                              │ Manager │       │ Manager  │
                              └────┬────┘       └────┬─────┘
                                   │                 │
                         ┌─────────┴─────────┐   ┌───┴───┐
                         │                   │   │       │
                    ┌────▼────┐       ┌──────▼───▼──┐
                    │ Bundled │       │ User Skill  │
                    │ Skills  │       │ Directories │
                    └─────────┘       └─────────────┘
```

## Path Resolution

Skills are discovered from multiple sources with configurable priority:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 (Highest) | CLI `--skills-path` | Directories specified at startup |
| 2 | `SKILLKIT_SKILLS_PATH` env | Colon-separated directory list |
| 3 (Lowest) | Bundled skills | Default skills shipped with SkillKit |

When a skill name exists in multiple locations, higher-priority paths override lower ones. This allows customizing bundled skills.

## Skill Discovery

The server scans configured directories for skill subdirectories:

1. Each subdirectory is checked for a `SKILL.md` file
2. Valid skills have their frontmatter parsed (name, description)
3. Skills are indexed by name for quick lookup
4. Directories starting with `_` are skipped

## MCP Tools

SkillKit exposes five tools to AI agents:

### skillkit_list_skills

Lists all available skills with their name and description.

**Input:** None

**Output:**
```json
{
  "skills": [
    {"name": "skill-creator", "description": "Guide for creating effective skills..."},
    {"name": "code-review", "description": "Code review workflow..."}
  ]
}
```

**Usage:** Call this first to discover available skills. The agent matches user requests to skill descriptions.

### skillkit_get_skill

Fetches the full SKILL.md content for a skill.

**Input:**
```json
{"name": "skill-creator"}
```

**Output:** Complete SKILL.md content (frontmatter + body)

**Usage:** After identifying a relevant skill, call this to load the full instructions.

### skillkit_get_script

Fetches a script file from a skill's `scripts/` folder.

**Input:**
```json
{"skill": "pdf-editor", "filename": "rotate_pdf.py"}
```

**Output:** Raw script file content

**Usage:** Only call when skill instructions reference a specific script.

### skillkit_get_reference

Fetches a reference document from a skill's `references/` folder.

**Input:**
```json
{"skill": "bigquery", "filename": "schema.md"}
```

**Output:** Reference document content

**Usage:** Only call when skill instructions reference a specific document.

### skillkit_get_skill_paths

Returns configured skill directories where new skills can be created.

**Input:** None

**Output:**
```json
{
  "paths": ["/path/to/team-skills/skills", "/path/to/personal-skills"]
}
```

**Usage:** Used by the skill-creator skill to determine where to create new skills. Does not include bundled paths (read-only).

## MCP Prompts

Prompts are registered dynamically from `prompts/` directories. Each prompt:

1. Has a name (filename without extension)
2. Has a description (from frontmatter)
3. Returns its body as a user message when invoked

Prompts appear as slash commands or menu items in MCP clients.

## Data Flow

### Typical Skill Usage

```
1. User: "Help me review this code"
         │
2. Agent: skillkit_list_skills()
         │
3. Server: Returns [{name: "code-review", description: "..."}]
         │
4. Agent: Matches "review code" → "code-review" skill
         │
5. Agent: skillkit_get_skill("code-review")
         │
6. Server: Returns SKILL.md content
         │
7. Agent: Follows instructions, may call get_script/get_reference
         │
8. Agent: Completes task according to skill guidance
```

### Prompt-Triggered Usage

```
1. User: /code-review (invokes prompt)
         │
2. Client: Sends prompt body to agent
         │
3. Agent: Sees "use skillkit to get code-review skill"
         │
4. Agent: skillkit_get_skill("code-review")
         │
5. Agent: Follows skill instructions
```

## Tool Annotations

All tools are marked with MCP annotations:

| Annotation | Value | Meaning |
|------------|-------|---------|
| `readOnlyHint` | `true` | Tools don't modify external state |
| `destructiveHint` | `false` | Tools are safe to call |
| `idempotentHint` | `true` | Same input always produces same output |
| `openWorldHint` | `false` | Tools operate on known, finite data |

## Validation

Skills are validated for:

- `SKILL.md` file exists
- Valid YAML frontmatter
- Required fields: `name`, `description`
- Name format: hyphen-case, 1-64 characters
- Description: max 1024 characters, no `<>` characters

Use `skillkit-mcp validate-skill <path>` to check a skill.

## Next Steps

- [Concepts](concepts.md) - Understand skills vs prompts
- [Creating Skills](creating-skills.md) - Author your own skills
- [Configuration](configuration.md) - Set up multiple skill repos
