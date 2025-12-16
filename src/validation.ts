/**
 * Skill validation utilities - validates SKILL.md files and skill directories.
 *
 * Ported from bundled-skills/skill-creator/scripts/quick_validate.py
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

/**
 * Allowed properties in SKILL.md frontmatter.
 */
const ALLOWED_PROPERTIES = new Set(["name", "description", "license"]);

/**
 * Maximum length for skill name (per spec).
 */
const MAX_NAME_LENGTH = 64;

/**
 * Maximum length for skill description (per spec).
 */
const MAX_DESCRIPTION_LENGTH = 1024;

/**
 * Result of skill validation.
 */
export interface ValidationResult {
	valid: boolean;
	message: string;
	errors?: string[];
}

/**
 * Validate a skill directory.
 *
 * Checks:
 * - SKILL.md exists
 * - Valid YAML frontmatter
 * - Required fields (name, description)
 * - Name format (hyphen-case, valid length)
 * - Description format (no angle brackets, valid length)
 * - No unexpected frontmatter properties
 *
 * @param skillPath - Path to the skill directory
 * @returns Validation result with valid flag and message
 */
export function validateSkill(skillPath: string): ValidationResult {
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
		return {
			valid: false,
			message: `Error reading SKILL.md: ${e instanceof Error ? e.message : String(e)}`,
			errors: [
				`Error reading SKILL.md: ${e instanceof Error ? e.message : String(e)}`,
			],
		};
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

	// Parse YAML frontmatter
	let frontmatter: Record<string, unknown>;
	try {
		const parsed = yaml.load(frontmatterText);
		if (
			typeof parsed !== "object" ||
			parsed === null ||
			Array.isArray(parsed)
		) {
			return {
				valid: false,
				message: "Frontmatter must be a YAML dictionary",
				errors: ["Frontmatter must be a YAML dictionary"],
			};
		}
		frontmatter = parsed as Record<string, unknown>;
	} catch (e) {
		return {
			valid: false,
			message: `Invalid YAML in frontmatter: ${e instanceof Error ? e.message : String(e)}`,
			errors: [
				`Invalid YAML in frontmatter: ${e instanceof Error ? e.message : String(e)}`,
			],
		};
	}

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
	if (!("name" in frontmatter)) {
		errors.push("Missing 'name' in frontmatter");
	}
	if (!("description" in frontmatter)) {
		errors.push("Missing 'description' in frontmatter");
	}

	if (errors.length > 0) {
		return {
			valid: false,
			message: errors.join("; "),
			errors,
		};
	}

	// Validate name
	const name = frontmatter.name;
	if (typeof name !== "string") {
		return {
			valid: false,
			message: `Name must be a string, got ${typeof name}`,
			errors: [`Name must be a string, got ${typeof name}`],
		};
	}

	const trimmedName = name.trim();
	if (trimmedName) {
		// Check naming convention (hyphen-case: lowercase with hyphens)
		if (!/^[a-z0-9-]+$/.test(trimmedName)) {
			errors.push(
				`Name '${trimmedName}' should be hyphen-case (lowercase letters, digits, and hyphens only)`,
			);
		}
		if (
			trimmedName.startsWith("-") ||
			trimmedName.endsWith("-") ||
			trimmedName.includes("--")
		) {
			errors.push(
				`Name '${trimmedName}' cannot start/end with hyphen or contain consecutive hyphens`,
			);
		}
		// Check name length
		if (trimmedName.length > MAX_NAME_LENGTH) {
			errors.push(
				`Name is too long (${trimmedName.length} characters). Maximum is ${MAX_NAME_LENGTH} characters.`,
			);
		}
	}

	// Validate description
	const description = frontmatter.description;
	if (typeof description !== "string") {
		return {
			valid: false,
			message: `Description must be a string, got ${typeof description}`,
			errors: [`Description must be a string, got ${typeof description}`],
		};
	}

	const trimmedDescription = description.trim();
	if (trimmedDescription) {
		// Check for angle brackets
		if (trimmedDescription.includes("<") || trimmedDescription.includes(">")) {
			errors.push("Description cannot contain angle brackets (< or >)");
		}
		// Check description length
		if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
			errors.push(
				`Description is too long (${trimmedDescription.length} characters). Maximum is ${MAX_DESCRIPTION_LENGTH} characters.`,
			);
		}
	}

	if (errors.length > 0) {
		return {
			valid: false,
			message: errors.join("; "),
			errors,
		};
	}

	return {
		valid: true,
		message: "Skill is valid!",
	};
}
