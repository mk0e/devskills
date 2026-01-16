# MCP Tools

SkillKit exposes five tools via MCP. All tools are read-only and idempotent.

## skillkit_list_skills

List all available skills.

**Parameters:** None

**Returns:** Array of `{ name, description }`

**Usage:** Call first to discover available skills.

```json
{
  "skills": [
    { "name": "code-review", "description": "Review code for quality..." },
    { "name": "deployment", "description": "Deploy to production..." }
  ]
}
```

## skillkit_get_skill

Get full instructions for a skill.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Skill name from `skillkit_list_skills` |

**Returns:** Full SKILL.md content (frontmatter + body)

**Usage:** Call after matching a skill to the user's task.

## skillkit_get_script

Get a script file from a skill.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `skill` | string | Skill name |
| `filename` | string | Script filename |

**Returns:** Raw script content

**Usage:** Call when skill instructions reference a script.

## skillkit_get_reference

Get a reference file from a skill.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `skill` | string | Skill name |
| `filename` | string | Reference filename |

**Returns:** Reference file content

**Usage:** Call when skill instructions reference a document.

## skillkit_get_skill_paths

Get writable skill directories.

**Parameters:** None

**Returns:** Array of path strings

**Usage:** Used by skill-creator to determine where to create new skills.

```json
{
  "paths": ["/Users/me/.skillkit"]
}
```

## Tool Annotations

All tools are annotated with:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

This indicates:
- Tools only read data, never modify
- Safe to call multiple times
- No side effects outside SkillKit
