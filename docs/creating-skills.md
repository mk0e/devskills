# Creating Skills

This guide covers how to create effective skills for AI coding agents.

## Skill Structure

Every skill is a directory containing a `SKILL.md` file and optional resources:

```
skill-name/
├── SKILL.md           # Required: instructions and metadata
├── scripts/           # Optional: executable code
└── references/        # Optional: documentation
```

## SKILL.md Format

The `SKILL.md` file has two parts: YAML frontmatter and markdown body.

### Frontmatter (Required)

```yaml
---
name: my-skill
description: Brief description of what this skill does and when to use it.
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (hyphen-case, 1-64 chars) |
| `description` | Yes | What the skill does and when to use it (max 1024 chars) |

The **description** is critical—it determines when the agent will load the skill. Include:
- What the skill does
- Specific triggers or contexts for when to use it

Example:
```yaml
description: Comprehensive document creation, editing, and analysis. Use when working with .docx files for creating, modifying, or editing documents.
```

### Body (Required)

The markdown body contains instructions for using the skill. Write in imperative form.

```markdown
---
name: code-review
description: Code review workflow for pull requests and code changes.
---

# Code Review

Review code changes for quality, security, and maintainability.

## Process

1. Read the changed files
2. Check for common issues:
   - Security vulnerabilities
   - Performance problems
   - Code style violations
3. Provide actionable feedback

## Using Scripts

For automated checks, use the lint script:
\`\`\`bash
scripts/lint.sh <file>
\`\`\`
```

## Bundled Resources

### Scripts (`scripts/`)

Executable code for tasks that require deterministic reliability or are frequently rewritten.

**When to include scripts:**
- The same code is being rewritten repeatedly
- Deterministic reliability is needed
- Complex operations that benefit from tested code

**Example:**
```
skills/pdf-editor/
├── SKILL.md
└── scripts/
    ├── rotate_pdf.py
    └── merge_pdfs.py
```

In SKILL.md, reference scripts like:
```markdown
To rotate a PDF, use the rotate script:
\`\`\`bash
python scripts/rotate_pdf.py <input.pdf> <degrees> <output.pdf>
\`\`\`
```

The agent retrieves scripts with `skillkit_get_script("pdf-editor", "rotate_pdf.py")`.

### References (`references/`)

Documentation and reference material loaded into context as needed.

**When to include references:**
- Database schemas the agent should know
- API documentation for specific services
- Domain knowledge or company policies
- Large content that would bloat SKILL.md

**Example:**
```
skills/bigquery/
├── SKILL.md
└── references/
    ├── schema.md
    └── query_patterns.md
```

In SKILL.md, point to references:
```markdown
Before writing queries, load the schema:
- Use `skillkit_get_reference("bigquery", "schema.md")` for table definitions
```

**Best practice:** For large reference files (>10k words), include grep patterns in SKILL.md so the agent can search efficiently.

## Creating a Skill

### Using the CLI

```bash
# Create skill structure
skillkit-mcp init-skill my-skill --path ./skills

# This creates:
# skills/my-skill/
# ├── SKILL.md
# ├── scripts/
# └── references/
```

### Manual Creation

```bash
mkdir -p skills/my-skill/scripts skills/my-skill/references
touch skills/my-skill/SKILL.md
```

### Validating

```bash
skillkit-mcp validate-skill skills/my-skill
```

Validation checks:
- SKILL.md exists
- Valid YAML frontmatter
- Required fields present (name, description)
- Name follows conventions (hyphen-case)
- No disallowed characters

## Creating a Prompt

Prompts are optional user-triggered entry points. Create one when users should be able to explicitly invoke the skill.

**Location:** `prompts/` directory (sibling to `skills/`)

```
my-team-skills/
├── skills/
│   └── code-review/
│       └── SKILL.md
└── prompts/
    └── code-review.md    # Optional prompt
```

**Format:**
```markdown
---
name: code-review
description: Start a code review session
---

I want to review code for quality and best practices. Use skillkit to get the code-review skill and follow its instructions.
```

The prompt body should:
- Describe user intent in first person
- Mention "use skillkit" so the agent fetches the skill
- Reference the skill name

## Best Practices

### Keep It Concise

The context window is a shared resource. Only include information the agent doesn't already know.

**Questions to ask:**
- Does the agent really need this explanation?
- Does this paragraph justify its token cost?

Prefer concise examples over verbose explanations.

### Match Freedom to Task Fragility

| Freedom Level | When to Use | Format |
|---------------|-------------|--------|
| High | Multiple valid approaches | Text instructions |
| Medium | Preferred pattern exists | Pseudocode or scripts with parameters |
| Low | Fragile, must be exact | Specific scripts, few parameters |

### Use Progressive Disclosure

Keep SKILL.md body under 500 lines. Move variant-specific details to reference files.

**Pattern: Domain-specific organization**

```
cloud-deploy/
├── SKILL.md (workflow + provider selection)
└── references/
    ├── aws.md (AWS deployment patterns)
    ├── gcp.md (GCP deployment patterns)
    └── azure.md (Azure deployment patterns)
```

When the user chooses AWS, the agent only loads `aws.md`.

### Write Good Descriptions

The description determines when your skill gets used. Make it:
- **Specific** - Include trigger contexts
- **Comprehensive** - Cover all use cases
- **Clear** - No jargon or ambiguity

## Naming Conventions

- Use **hyphen-case** for skill names: `code-review`, `pdf-editor`
- Names must start with a letter
- Only letters, numbers, and hyphens allowed
- Maximum 64 characters
- No leading/trailing hyphens or double hyphens

## Testing Your Skill

1. Configure SkillKit to include your skill directory
2. Ask your AI agent to use the skill
3. Observe any struggles or inefficiencies
4. Update SKILL.md or resources
5. Test again

## Next Steps

- [Configuration](configuration.md) - Set up SkillKit with multiple skill repos
- [How It Works](how-it-works.md) - Understand the MCP server architecture
