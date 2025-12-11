# Creating Skills

## Using the skill-creator Skill

The best way to create a new skill is to use the built-in `skill-creator` skill:

```
Create a new skill for [your use case]. Use devskills.
```

This will guide the AI agent through the skill creation process with best practices.

## Manual Creation

If you prefer to create skills manually:

1. Create a new folder in `skills/`:
   ```bash
   mkdir -p skills/my-skill/scripts skills/my-skill/references
   ```

2. Create `skills/my-skill/SKILL.md` with frontmatter and instructions:

   ```yaml
   ---
   name: my-skill
   description: Brief description shown in list_skills()
   ---

   ## Instructions

   Step-by-step instructions for the AI to follow.
   ```

3. Add scripts in `scripts/` and reference docs in `references/` as needed

## Skill Structure

```
skills/my-skill/
├── SKILL.md          # Required: instructions + frontmatter
├── scripts/          # Optional: executable scripts
└── references/       # Optional: reference documents
```

For comprehensive guidance on skill design, bundled resources, and best practices, use the `skill-creator` skill.
