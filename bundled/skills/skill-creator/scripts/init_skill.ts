#!/usr/bin/env npx tsx
/**
 * Skill Initializer - Creates a new skill from template
 *
 * Usage:
 *   npx tsx init_skill.ts <skill-name> --path <path>
 *
 * Examples:
 *   npx tsx init_skill.ts my-new-skill --path skills/
 *   npx tsx init_skill.ts my-api-helper --path skills/
 */

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SKILL_TEMPLATE = `---
name: {skill_name}
description: [TODO: Complete and informative explanation of what the skill does and when to use it. Include WHEN to use this skill - specific scenarios, file types, or tasks that trigger it.]
---

# {skill_title}

## Overview

[TODO: 1-2 sentences explaining what this skill enables]

## Structuring This Skill

[TODO: Choose the structure that best fits this skill's purpose. Common patterns:

**1. Workflow-Based** (best for sequential processes)
- Works well when there are clear step-by-step procedures
- Example: DOCX skill with "Workflow Decision Tree" → "Reading" → "Creating" → "Editing"
- Structure: ## Overview → ## Workflow Decision Tree → ## Step 1 → ## Step 2...

**2. Task-Based** (best for tool collections)
- Works well when the skill offers different operations/capabilities
- Example: PDF skill with "Quick Start" → "Merge PDFs" → "Split PDFs" → "Extract Text"
- Structure: ## Overview → ## Quick Start → ## Task Category 1 → ## Task Category 2...

**3. Reference/Guidelines** (best for standards or specifications)
- Works well for brand guidelines, coding standards, or requirements
- Example: Brand styling with "Brand Guidelines" → "Colors" → "Typography" → "Features"
- Structure: ## Overview → ## Guidelines → ## Specifications → ## Usage...

**4. Capabilities-Based** (best for integrated systems)
- Works well when the skill provides multiple interrelated features
- Example: Product Management with "Core Capabilities" → numbered capability list
- Structure: ## Overview → ## Core Capabilities → ### 1. Feature → ### 2. Feature...

Patterns can be mixed and matched as needed. Most skills combine patterns (e.g., start with task-based, add workflow for complex operations).

Delete this entire "Structuring This Skill" section when done - it's just guidance.]

## [TODO: Replace with the first main section based on chosen structure]

[TODO: Add content here:
- Code samples for technical skills
- Decision trees for complex workflows
- Concrete examples with realistic user requests
- References to scripts/references as needed]

## Resources

This skill includes example resource directories:

### scripts/
Executable code (TypeScript/Python/Bash/etc.) that can be run directly to perform specific operations.

**Appropriate for:** Scripts that perform automation, data processing, or specific operations.

### references/
Documentation and reference material loaded into context as needed.

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that the agent should reference while working.

---

**Any unneeded directories can be deleted.** Not every skill requires both types of resources.
`;

const EXAMPLE_SCRIPT = `#!/usr/bin/env npx tsx
/**
 * Example helper script for {skill_name}
 *
 * This is a placeholder script that can be executed directly.
 * Replace with actual implementation or delete if not needed.
 */

function main(): void {
  console.log("This is an example script for {skill_name}");
  // TODO: Add actual script logic here
}

main();
`;

const EXAMPLE_REFERENCE = `# Reference Documentation for {skill_title}

This is a placeholder for detailed reference documentation.
Replace with actual reference content or delete if not needed.

## When Reference Docs Are Useful

Reference docs are ideal for:
- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step processes
- Information too lengthy for main SKILL.md
- Content that's only needed for specific use cases

## Structure Suggestions

### API Reference Example
- Overview
- Authentication
- Endpoints with examples
- Error codes
- Rate limits

### Workflow Guide Example
- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices
`;

function titleCaseSkillName(skillName: string): string {
	return skillName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function initSkill(skillName: string, path: string): string | null {
	const skillDir = resolve(join(path, skillName));

	if (existsSync(skillDir)) {
		console.error(`Error: Skill directory already exists: ${skillDir}`);
		return null;
	}

	try {
		mkdirSync(skillDir, { recursive: true });
		console.log(`Created skill directory: ${skillDir}`);
	} catch (e) {
		console.error(`Error creating directory: ${e}`);
		return null;
	}

	const skillTitle = titleCaseSkillName(skillName);
	const skillContent = SKILL_TEMPLATE.replace(
		/{skill_name}/g,
		skillName,
	).replace(/{skill_title}/g, skillTitle);

	const skillMdPath = join(skillDir, "SKILL.md");
	try {
		writeFileSync(skillMdPath, skillContent);
		console.log("Created SKILL.md");
	} catch (e) {
		console.error(`Error creating SKILL.md: ${e}`);
		return null;
	}

	try {
		const scriptsDir = join(skillDir, "scripts");
		mkdirSync(scriptsDir, { recursive: true });
		const exampleScript = join(scriptsDir, "example.ts");
		writeFileSync(
			exampleScript,
			EXAMPLE_SCRIPT.replace(/{skill_name}/g, skillName),
		);
		chmodSync(exampleScript, 0o755);
		console.log("Created scripts/example.ts");

		const referencesDir = join(skillDir, "references");
		mkdirSync(referencesDir, { recursive: true });
		const exampleReference = join(referencesDir, "api_reference.md");
		writeFileSync(
			exampleReference,
			EXAMPLE_REFERENCE.replace(/{skill_title}/g, skillTitle),
		);
		console.log("Created references/api_reference.md");
	} catch (e) {
		console.error(`Error creating resource directories: ${e}`);
		return null;
	}

	console.log(`\nSkill '${skillName}' initialized at ${skillDir}`);
	console.log("\nNext steps:");
	console.log(
		"1. Edit SKILL.md to complete the TODO items and update the description",
	);
	console.log(
		"2. Customize or delete the example files in scripts/ and references/",
	);
	console.log("3. Test the skill with your AI agent");

	return skillDir;
}

// Main
const args = process.argv.slice(2);
if (args.length < 3 || args[1] !== "--path") {
	console.log("Usage: npx tsx init_skill.ts <skill-name> --path <path>");
	console.log("\nSkill name requirements:");
	console.log("  - Hyphen-case identifier (e.g., 'data-analyzer')");
	console.log("  - Lowercase letters, digits, and hyphens only");
	console.log("\nExamples:");
	console.log("  npx tsx init_skill.ts my-new-skill --path skills/");
	console.log("  npx tsx init_skill.ts my-api-helper --path skills/");
	process.exit(1);
}

const skillName = args[0];
const path = args[2];

console.log(`Initializing skill: ${skillName}`);
console.log(`Location: ${path}`);
console.log();

const result = initSkill(skillName, path);
process.exit(result ? 0 : 1);
