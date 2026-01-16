# Quick Start

Get SkillKit running in under 5 minutes.

## 1. Install

Add SkillKit to your MCP configuration. Example for GitHub Copilot (VS Code settings):

```json
{
  "mcp": {
    "servers": {
      "skillkit": {
        "type": "stdio",
        "command": "npx",
        "args": ["skillkit-mcp"]
      }
    }
  }
}
```

For other agents, see [Integrations](../integrations/overview.md).

Restart your agent after adding the configuration.

## 2. Use

Add `use skillkit` to your prompt:

```
Create a skill for reviewing code. use skillkit
```

> **Tip:** To avoid adding "use skillkit" to every prompt, add this to your agent's custom instructions (e.g., `.github/copilot-instructions.md` for Copilot):
> ```
> Use skillkit for working with skills.
> ```

## 3. Create Your First Skill

```
Create a skill for reviewing PRs according to our team standards. use skillkit
```

The bundled `skill-creator` guides you through the process. It will:
1. Ask about your requirements
2. Create the skill structure
3. Write the SKILL.md file

Skills are saved to `~/.skillkit/skills/` by default.

## 4. Use Your Skill

```
Review this PR for issues. use skillkit
```

The agent discovers your skill and follows its instructions.

## What's Next

- [Skill Repositories](../guide/skill-repositories.md) - Share skills with your team
- [Creating Skills](../guide/creating-your-first-skill.md) - Deep dive into skill authoring
- [Integrations](../integrations/overview.md) - Setup guides for each agent
