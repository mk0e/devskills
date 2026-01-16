/**
 * Template for the init-skill command - creates a new skill from template.
 */

import dedent from "dedent";

export const SKILL_MD_TEMPLATE = dedent`
	---
	name: {name}
	description: "TODO: Describe when this skill should be used"
	---

	# {title}

	## Overview

	[What this skill helps accomplish and why it matters]

	## When to Use

	Use this skill when:
	- [Specific trigger condition 1]
	- [Specific trigger condition 2]

	Do NOT use this skill when:
	- [Anti-pattern or wrong use case]

	## Instructions

	### Step 1: [First Action]

	[Detailed instructions for step 1]

	### Step 2: [Second Action]

	[Detailed instructions for step 2]

	## Resources

	### Scripts (if needed)

	To load a helper script:
	\`\`\`
	Use skillkit_get_script("{name}", "script_name.ts")
	\`\`\`

	### References (if needed)

	For additional context:
	\`\`\`
	Use skillkit_get_reference("{name}", "reference_name.md")
	\`\`\`
`;

/**
 * Generate a SKILL.md file content for a new skill.
 *
 * @param skillName - The skill name (hyphenated, e.g., 'my-skill')
 * @returns The SKILL.md content
 */
export function generateSkillMd(skillName: string): string {
	// Convert hyphenated name to title case
	const title = skillName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return SKILL_MD_TEMPLATE.replace(/{name}/g, skillName).replace(
		/{title}/g,
		title,
	);
}
