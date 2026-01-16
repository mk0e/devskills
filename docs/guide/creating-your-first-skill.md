# Creating Your First Skill

Skills are folders containing a SKILL.md file with instructions for the AI agent.

## Skill Structure

```
my-skill/
├── SKILL.md          # Required: instructions and metadata
├── scripts/          # Optional: executable code
└── references/       # Optional: documentation files
```

## Creating a Skill

### Option 1: Use the skill-creator (recommended)

Ask your AI agent:

```
Create a skill for reviewing code. use skillkit
```

The bundled `skill-creator` skill guides you through the process interactively.

### Option 2: Use the CLI

```bash
npx skillkit-mcp init-skill code-review --path ~/.skillkit/skills
```

### Option 3: Create manually

```bash
mkdir -p ~/.skillkit/skills/code-review
touch ~/.skillkit/skills/code-review/SKILL.md
```

## Writing SKILL.md

A skill has two parts: **frontmatter** (metadata) and **body** (instructions).

### Frontmatter

YAML metadata at the top:

```yaml
---
name: code-review
description: Review code for quality, security, and best practices. Use when reviewing PRs, commits, or code snippets.
---
```

- `name` - Skill identifier (hyphen-case, 1-64 chars)
- `description` - When to use this skill (shown during discovery)

The description is critical—it determines when the agent selects this skill.

### Body

Markdown instructions for the agent:

```markdown
# Code Review

When reviewing code, check for:

1. **Security issues**
   - Hardcoded secrets
   - Input validation
   - Authentication/authorization

2. **Code quality**
   - Readability
   - Error handling
   - Test coverage

## Output Format

Provide feedback as:
- **Critical** - Must fix before merge
- **Important** - Should fix
- **Suggestion** - Nice to have
```

## Complete Example

```markdown
---
name: code-review
description: Review code for quality, security, and best practices. Use when reviewing PRs, commits, or code snippets.
---

# Code Review

When reviewing code, follow this checklist:

## Security
- [ ] No hardcoded secrets or credentials
- [ ] Input is validated and sanitized
- [ ] Authentication/authorization is correct

## Quality
- [ ] Code is readable and well-structured
- [ ] Error handling is appropriate
- [ ] Edge cases are considered

## Style
- [ ] Follows project conventions
- [ ] No unnecessary complexity
- [ ] Comments where needed

## Output

Provide feedback grouped by severity:

**Critical** - Must fix before merge
**Important** - Should fix
**Suggestion** - Nice to have
```

## Tips for Effective Skills

### Keep it concise

Skills share context with the conversation. Don't add information the agent already knows.

### Be specific in descriptions

Bad: `Code review skill`

Good: `Review code for quality, security, and best practices. Use when reviewing PRs, commits, or code snippets.`

### Use imperative form

Write instructions as commands: "Check for...", "Verify that...", "Output as..."

### Include examples

Show the expected format for outputs when it matters.

## Adding Scripts and References

For more complex skills, see:
- [Using Scripts](using-scripts.md) - Add executable code
- [Using References](using-references.md) - Add documentation files

## Validation

Check your skill is valid:

```bash
npx skillkit-mcp validate ~/.skillkit
```

## Next Steps

- [Skill Repositories](skill-repositories.md) - Share with your team
- [Skill Format Reference](../reference/skill-format.md) - Complete specification
