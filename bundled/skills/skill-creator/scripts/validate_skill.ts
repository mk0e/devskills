#!/usr/bin/env npx tsx
/**
 * Skill Validator - Validates a skill directory's SKILL.md
 *
 * Usage:
 *   npx tsx validate_skill.ts <skill-directory>
 *
 * Examples:
 *   npx tsx validate_skill.ts skills/my-skill
 *   npx tsx validate_skill.ts ./bundled-skills/skill-creator
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_PROPERTIES = new Set(["name", "description", "license"]);
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;

interface ValidationResult {
	valid: boolean;
	message: string;
	errors?: string[];
}

function parseYamlFrontmatter(text: string): Record<string, string> {
	const result: Record<string, string> = {};
	const lines = text.split("\n");

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			let value = line.slice(colonIndex + 1).trim();
			// Handle multi-line values (simple case)
			if (value.startsWith('"') && value.endsWith('"')) {
				value = value.slice(1, -1);
			} else if (value.startsWith("'") && value.endsWith("'")) {
				value = value.slice(1, -1);
			}
			result[key] = value;
		}
	}

	return result;
}

function validateSkill(skillPath: string): ValidationResult {
	const errors: string[] = [];

	// Check SKILL.md exists
	const skillMdPath = join(skillPath, "SKILL.md");
	if (!existsSync(skillMdPath)) {
		return {
			valid: false,
			message: "SKILL.md not found",
			errors: ["SKILL.md not found"],
		};
	}

	// Read content
	let content: string;
	try {
		content = readFileSync(skillMdPath, "utf-8");
	} catch (e) {
		const msg = `Error reading SKILL.md: ${e instanceof Error ? e.message : String(e)}`;
		return { valid: false, message: msg, errors: [msg] };
	}

	// Check for frontmatter
	if (!content.startsWith("---")) {
		return {
			valid: false,
			message: "No YAML frontmatter found",
			errors: ["No YAML frontmatter found"],
		};
	}

	// Extract frontmatter
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) {
		return {
			valid: false,
			message: "Invalid frontmatter format",
			errors: ["Invalid frontmatter format"],
		};
	}

	const frontmatterText = match[1];
	const frontmatter = parseYamlFrontmatter(frontmatterText);

	// Check for unexpected properties
	const unexpectedKeys = Object.keys(frontmatter).filter(
		(key) => !ALLOWED_PROPERTIES.has(key),
	);
	if (unexpectedKeys.length > 0) {
		const sortedUnexpected = unexpectedKeys.sort().join(", ");
		const sortedAllowed = [...ALLOWED_PROPERTIES].sort().join(", ");
		return {
			valid: false,
			message: `Unexpected key(s) in SKILL.md frontmatter: ${sortedUnexpected}. Allowed properties are: ${sortedAllowed}`,
			errors: [
				`Unexpected key(s) in SKILL.md frontmatter: ${sortedUnexpected}. Allowed properties are: ${sortedAllowed}`,
			],
		};
	}

	// Check required fields
	if (!frontmatter.name) {
		errors.push("Missing 'name' in frontmatter");
	}
	if (!frontmatter.description) {
		errors.push("Missing 'description' in frontmatter");
	}

	if (errors.length > 0) {
		return { valid: false, message: errors.join("; "), errors };
	}

	// Validate name
	const name = frontmatter.name.trim();
	if (name) {
		if (!/^[a-z0-9-]+$/.test(name)) {
			errors.push(
				`Name '${name}' should be hyphen-case (lowercase letters, digits, and hyphens only)`,
			);
		}
		if (name.startsWith("-") || name.endsWith("-") || name.includes("--")) {
			errors.push(
				`Name '${name}' cannot start/end with hyphen or contain consecutive hyphens`,
			);
		}
		if (name.length > MAX_NAME_LENGTH) {
			errors.push(
				`Name is too long (${name.length} characters). Maximum is ${MAX_NAME_LENGTH} characters.`,
			);
		}
	}

	// Validate description
	const description = frontmatter.description.trim();
	if (description) {
		if (description.includes("<") || description.includes(">")) {
			errors.push("Description cannot contain angle brackets (< or >)");
		}
		if (description.length > MAX_DESCRIPTION_LENGTH) {
			errors.push(
				`Description is too long (${description.length} characters). Maximum is ${MAX_DESCRIPTION_LENGTH} characters.`,
			);
		}
	}

	if (errors.length > 0) {
		return { valid: false, message: errors.join("; "), errors };
	}

	return { valid: true, message: "Skill is valid!" };
}

// Main
const args = process.argv.slice(2);
if (args.length !== 1) {
	console.log("Usage: npx tsx validate_skill.ts <skill_directory>");
	process.exit(1);
}

const result = validateSkill(args[0]);
console.log(result.message);
process.exit(result.valid ? 0 : 1);
