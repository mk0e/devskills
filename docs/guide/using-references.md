# Using References

References are documentation files that skills can include for context the agent needs while working.

## When to Use References

Use references for:
- Database schemas
- API documentation
- Company policies
- Configuration specifications
- Large content that would bloat SKILL.md

Don't use references when:
- Content is short enough for SKILL.md
- Information is publicly available (agent may already know it)
- Content changes frequently

## Adding References

Create a `references/` folder in your skill:

```
my-skill/
├── SKILL.md
└── references/
    ├── schema.json
    ├── api-docs.md
    └── style-guide.md
```

References can be any text format: Markdown, JSON, YAML, plain text.

## Referencing in SKILL.md

Tell the agent when to fetch references:

```markdown
---
name: database-query
description: Query the company database for reports and analysis.
---

# Database Query

## Before Writing Queries

Fetch the database schema:
```
skillkit_get_reference("database-query", "schema.md")
```

The schema shows all tables, columns, and relationships.

## Query Guidelines

- Use the schema to verify table and column names
- Follow company naming conventions
- Include appropriate WHERE clauses for performance
```

## How References Are Loaded

References use progressive disclosure:

1. **SKILL.md loaded** - Agent sees references are available
2. **Agent requests reference** - Calls `skillkit_get_reference(skill, filename)`
3. **Content returned** - Agent uses it for the task

References are fetched on-demand, keeping initial context small.

## Example: API Integration Skill

```
stripe-integration/
├── SKILL.md
└── references/
    ├── api-overview.md
    ├── webhooks.md
    └── error-codes.md
```

**SKILL.md:**
```markdown
---
name: stripe-integration
description: Integrate Stripe payments - subscriptions, invoices, webhooks.
---

# Stripe Integration

## Available References

- `api-overview.md` - Core API patterns and authentication
- `webhooks.md` - Webhook events and handling
- `error-codes.md` - Error codes and troubleshooting

Fetch the relevant reference before implementing:
```
skillkit_get_reference("stripe-integration", "api-overview.md")
```

## Common Tasks

### Creating a Subscription
1. Fetch `api-overview.md` for authentication setup
2. Use the Stripe SDK to create customer and subscription
3. Handle errors per `error-codes.md`
```

## Large Reference Files

For references over 10k words, help the agent find relevant sections:

```markdown
## Database Schema

The full schema is in `references/schema.md` (large file).

To find specific tables, search for:
- `## users` - User tables
- `## orders` - Order tables
- `## products` - Product catalog

Fetch and search:
```
skillkit_get_reference("my-skill", "schema.md")
```
Then grep for the section you need.
```

## Organizing References

### By domain
```
cloud-deploy/
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

### By type
```
api-client/
└── references/
    ├── endpoints.md
    ├── authentication.md
    └── rate-limits.md
```

### By audience
```
onboarding/
└── references/
    ├── developer-setup.md
    ├── architecture.md
    └── coding-standards.md
```

## Best Practices

### Keep references current
Outdated references are worse than none. Update when source changes.

### Use clear filenames
`database-schema.md` not `schema.md`. Self-documenting names help the agent.

### Structure for scanning
Use headers, lists, and code blocks. Agents scan better than they read walls of text.

### Don't duplicate public docs
If it's in official documentation the agent knows, don't copy it. Reference the official source instead.

## Reference vs. SKILL.md Content

| Put in SKILL.md | Put in References |
|-----------------|-------------------|
| Instructions and workflow | Supporting documentation |
| When to use the skill | Schemas and specifications |
| Output format | Detailed API docs |
| Short, essential context | Large or optional content |
