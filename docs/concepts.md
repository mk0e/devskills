# Concepts

## What Are Skills?

Skills are a concept introduced by [Anthropic](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) for teaching AI agents how to perform specific tasks consistently. They're modular, self-contained knowledge packages that extend agent capabilities with specialized workflows, domain expertise, and tool integrations.

Think of skills as "onboarding guides" for specific domains. They transform a general-purpose AI agent into a specialized one equipped with procedural knowledge—just like onboarding a new team member with your company's specific processes.

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts and references for complex and repetitive tasks

### Why Skills Matter

Without skills, you'd need to re-explain processes every conversation. With skills:

- **Consistency** - The same task gets done the same way every time
- **Efficiency** - No need to repeat instructions across conversations
- **Shareability** - Teams can share knowledge via git repositories
- **Progressive loading** - Context is loaded only when needed

## DevSkills: Extending the Concept

DevSkills brings Anthropic's skills concept to any MCP-compatible AI agent through the Model Context Protocol. This means:

- **GitHub Copilot**, **Cursor**, **Claude Code**, and any other MCP-enabled tool can use skills
- Skills are shared via **git repositories**, enabling team collaboration
- Multiple skill repositories can be connected simultaneously
- Skills can optionally be exposed as **user-triggered prompts**

## Skills vs Prompts

DevSkills supports two complementary concepts: **skills** and **prompts**.

### Skills

Skills are **agent-triggered**. The AI agent discovers available skills and loads them based on the task at hand.

```
skills/
└── code-review/
    ├── SKILL.md           # Instructions and metadata
    ├── scripts/           # Executable code (optional)
    └── references/        # Documentation (optional)
```

**How skills work:**
1. Agent calls `devskills_list_skills()` to see available skills
2. Agent matches user's request to a skill description
3. Agent calls `devskills_get_skill("code-review")` to load instructions
4. Agent follows the skill's guidance

**When to use skills:**
- The agent should decide when to apply domain knowledge
- Multiple tasks might benefit from the same skill
- The workflow is primarily agent-driven

### Prompts

Prompts are **user-triggered**. They appear as slash commands that users invoke explicitly.

```
prompts/
└── code-review.md         # User-facing trigger
```

**How prompts work:**
1. User types `/code-review` (or selects from a menu)
2. The prompt content is sent to the agent
3. The prompt instructs the agent to load the relevant skill

**When to use prompts:**
- Users should explicitly trigger a workflow
- The task has a clear entry point (e.g., "review this PR")
- You want a discoverable, named command

### Comparison

| Aspect | Skills | Prompts |
|--------|--------|---------|
| **Trigger** | Agent matches task to skill | User invokes explicitly |
| **Discovery** | Agent lists and searches | User sees in command menu |
| **Content** | Detailed instructions + resources | Concise intent description |
| **Required** | Yes (core functionality) | No (optional enhancement) |

### Working Together

A common pattern is to create both:

1. **Skill** - Contains the actual instructions, scripts, and references
2. **Prompt** - A short trigger that tells the agent to load the skill

Example prompt (`prompts/code-review.md`):
```markdown
---
name: code-review
description: Start a code review session
---

I want to review code for quality and best practices. Use devskills to get the code-review skill and follow its instructions.
```

This way:
- Users can explicitly trigger code review with `/code-review`
- The agent can also invoke the skill automatically when appropriate

## Progressive Disclosure

Skills use a three-level loading system to manage context efficiently:

| Level | Content | When Loaded | Size Target |
|-------|---------|-------------|-------------|
| 1 | Metadata (name + description) | Always in context | ~100 words |
| 2 | SKILL.md body | When skill triggers | <5k words |
| 3 | Bundled resources | As needed | Unlimited |

This pattern ensures the agent's context window isn't overwhelmed with instructions for skills that aren't being used.

## Next Steps

- [Creating Skills](creating-skills.md) - Learn how to author skills
- [Configuration](configuration.md) - Set up DevSkills with your agent
