/**
 * Templates for the init command - creates a skills repository.
 */

import dedent from "dedent";

export const README_TEMPLATE = dedent`
	# {name}

	Skills repository for [SkillKit](https://github.com/anthropics/skillkit-mcp).

	## Setup

	Add SkillKit to your MCP configuration:

	### Local path

	\`\`\`json
	{
	  "mcp": {
	    "servers": {
	      "skillkit": {
	        "type": "stdio",
	        "command": "npx",
	        "args": ["skillkit-mcp", "--skills-path", "{path}"]
	      }
	    }
	  }
	}
	\`\`\`

	### Git URL (after pushing to remote)

	\`\`\`json
	{
	  "mcp": {
	    "servers": {
	      "skillkit": {
	        "type": "stdio",
	        "command": "npx",
	        "args": ["skillkit-mcp", "--skills-path", "<your-git-url>#main"]
	      }
	    }
	  }
	}
	\`\`\`

	## Usage

	Add \`use skillkit\` to your prompt:

	\`\`\`
	Help me with [task]. use skillkit
	\`\`\`

	## Skills

	<!-- SKILLS:START -->
	| Skill | Description |
	|-------|-------------|
	<!-- SKILLS:END -->

	## Creating Skills

	Ask your AI agent:

	\`\`\`
	Create a skill for [your use case]. use skillkit
	\`\`\`

	Or use the CLI:

	\`\`\`bash
	npx skillkit-mcp init-skill my-skill --path ./skills
	\`\`\`
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

/**
 * Markers for the skills section in README
 */
export const SKILLS_START_MARKER = "<!-- SKILLS:START -->";
export const SKILLS_END_MARKER = "<!-- SKILLS:END -->";
