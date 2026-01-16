# Skill Format

A skill is a folder containing a SKILL.md file and optional resources.

## Structure

```
my-skill/
├── SKILL.md          # Required
├── scripts/          # Optional
│   └── *.py, *.sh, *.ts, ...
└── references/       # Optional
    └── *.md, *.json, ...
```

## SKILL.md

### Frontmatter

YAML metadata between `---` markers:

```yaml
---
name: code-review
description: Review code for quality, security, and best practices.
---
```

#### Required Fields

| Field | Description | Constraints |
|-------|-------------|-------------|
| `name` | Skill identifier | Hyphen-case, 1-64 chars, starts with letter |
| `description` | When to use this skill | Max 1024 chars, no `<>` characters |

#### Optional Fields

| Field | Description |
|-------|-------------|
| `license` | License identifier |

### Body

Markdown instructions following the frontmatter:

```markdown
---
name: code-review
description: Review code for quality and security.
---

# Code Review

When reviewing code:

1. Check for security issues
2. Verify error handling
3. Review test coverage

## Output Format

- **Critical**: Must fix
- **Important**: Should fix
- **Suggestion**: Nice to have
```

## Scripts

Executable files in `scripts/`:

```
my-skill/
└── scripts/
    ├── validate.py
    └── format.sh
```

The agent fetches scripts on demand using `skillkit_get_script()`.

**When to use scripts:**
- Deterministic operations that shouldn't be rewritten each time
- Complex logic that benefits from tested, versioned code
- Operations requiring specific libraries

## References

Documentation files in `references/`:

```
my-skill/
└── references/
    ├── schema.json
    └── api-docs.md
```

The agent fetches references on demand using `skillkit_get_reference()`.

**When to use references:**
- Database schemas
- API documentation
- Company policies
- Large content that shouldn't be in SKILL.md

## Naming Conventions

### Skill Names

- Hyphen-case: `code-review`, `api-docs`, `db-migration`
- Descriptive: name indicates the skill's purpose
- 1-64 characters
- Starts with a letter

### File Names

- Scripts: any valid filename with appropriate extension
- References: any valid filename, `.md` recommended for text

## Validation

Check a skill is valid:

```bash
npx skillkit-mcp validate ~/my-skills
```

### Validation Rules

1. `SKILL.md` must exist
2. Frontmatter must be valid YAML
3. `name` field required, must match naming rules
4. `description` field required, max 1024 characters
5. Folders starting with `_` are ignored

## Best Practices

### Keep SKILL.md Concise

- Under 500 lines
- Move large content to references
- Don't explain what the agent already knows

### Write Clear Descriptions

The description determines when the skill is selected:

```yaml
# Bad
description: Code review skill

# Good
description: Review code for quality, security, and best practices. Use when reviewing PRs, commits, or code snippets.
```

### Use Progressive Disclosure

1. **Metadata** (always loaded): name + description
2. **SKILL.md body** (when triggered): instructions
3. **Scripts/references** (on demand): supporting files

Don't load everything upfront. Let the agent request what it needs.
