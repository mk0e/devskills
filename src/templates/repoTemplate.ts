/**
 * Templates for the init command - creates a team skills repository.
 */

import dedent from "dedent";

export const README_TEMPLATE = dedent`
	# {name}

	Team skills repository for [SkillKit](https://github.com/mk0e/skillkit-mcp) - reusable knowledge packages for AI coding agents.

	## Structure

	\`\`\`
	{name}/
	├── skills/       # Skill directories (each with SKILL.md)
	├── prompts/      # User-triggered prompts (slash commands)
	└── README.md
	\`\`\`

	## Setup

	### GitHub Copilot (VS Code)

	Add to your VS Code settings:

	\`\`\`json
	{
	  "mcp": {
	    "servers": {
	      "skillkit": {
	        "type": "stdio",
	        "command": "npx",
	        "args": [
	          "skillkit-mcp",
	          "--skills-path",
	          "/absolute/path/to/{name}/skills"
	        ]
	      }
	    }
	  }
	}
	\`\`\`

	### Other MCP Clients

	\`\`\`json
	{
	  "mcpServers": {
	    "skillkit": {
	      "command": "npx",
	      "args": ["skillkit-mcp", "--skills-path", "/path/to/{name}/skills"]
	    }
	  }
	}
	\`\`\`

	## How to Use

	Mention "use skillkit" in your prompt:

	\`\`\`
	Help me with [task]. Use skillkit.
	\`\`\`

	The agent will discover and load the relevant skill automatically.

	## Creating Skills

	Ask your AI agent:

	\`\`\`
	I want to create a new skill for [your use case]. Use skillkit.
	\`\`\`

	The agent will guide you through the process interactively.

	**Alternative:** Use the CLI:

	\`\`\`bash
	npx skillkit-mcp init-skill my-skill --path ./skills
	\`\`\`

	## Skills vs Prompts

	- **Skills** (\`skills/\`): Agent-triggered knowledge packages. The agent discovers and loads them based on the task.
	- **Prompts** (\`prompts/\`): User-triggered slash commands that explicitly invoke skills.

	## Available Skills

	| Skill | Description |
	|-------|-------------|
	| | |
`;

export const GITIGNORE_TEMPLATE = dedent`
	# Node
	node_modules/
	dist/

	# IDE
	.idea/
	*.swp
	.vscode/

	# OS
	.DS_Store

	# Environment
	.env
	.env.local
`;

export const SKILLS_GITKEEP = "# Add your skills here\n";

export const PROMPTS_GITKEEP = "# Add your prompts here\n";
