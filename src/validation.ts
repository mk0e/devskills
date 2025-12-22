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
 * Result of prompt validation.
 */
export interface PromptValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
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

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1,
				);
			}
		}
	}

	return matrix[b.length][a.length];
}

/**
 * Find similar variable name (for typo suggestions).
 */
function findSimilar(name: string, candidates: string[]): string | undefined {
	for (const candidate of candidates) {
		const distance = levenshteinDistance(name, candidate);
		if (distance <= 2 && distance > 0) {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Validate a prompt file (strict mode for CLI).
 *
 * @param promptPath - Path to the prompt .md file.
 * @returns Validation result with errors and warnings.
 */
export function validatePrompt(promptPath: string): PromptValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check file exists
	if (!existsSync(promptPath)) {
		return {
			valid: false,
			errors: [`Prompt file not found: ${promptPath}`],
			warnings: [],
		};
	}

	// Read content
	let content: string;
	try {
		content = readFileSync(promptPath, "utf-8");
	} catch (e) {
		return {
			valid: false,
			errors: [`Error reading prompt: ${e instanceof Error ? e.message : String(e)}`],
			warnings: [],
		};
	}

	// Parse frontmatter
	const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
	let frontmatter: Record<string, unknown> = {};
	if (fmMatch) {
		try {
			frontmatter = (yaml.load(fmMatch[1]) as Record<string, unknown>) ?? {};
		} catch {
			// Invalid YAML handled below
		}
	}

	// Extract body
	const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)/);
	const body = bodyMatch ? bodyMatch[1].trim() : content.trim();

	// Parse arguments from frontmatter
	const definedArgs = new Map<string, Record<string, unknown>>();
	if (frontmatter.arguments && typeof frontmatter.arguments === "object") {
		for (const [argName, argDef] of Object.entries(frontmatter.arguments as Record<string, unknown>)) {
			const def = (argDef ?? {}) as Record<string, unknown>;
			definedArgs.set(argName, def);

			// Check type is valid
			if (def.type !== undefined) {
				const validTypes = ["string", "number", "boolean"];
				if (!validTypes.includes(def.type as string)) {
					errors.push(`Invalid type '${def.type}'. Use: ${validTypes.join(", ")}.`);
				}
			}

			// Warning: missing description
			if (!def.description) {
				warnings.push(`Argument '${argName}' has no description.`);
			}
		}
	}

	// Extract variables from body
	const bodyVars = new Set<string>();
	for (const match of body.matchAll(/\{\{(\w+)\}\}/g)) {
		bodyVars.add(match[1]);
	}

	// Check for undefined variables
	const definedArgNames = [...definedArgs.keys()];
	for (const varName of bodyVars) {
		if (!definedArgs.has(varName)) {
			const similar = findSimilar(varName, definedArgNames);
			if (similar) {
				errors.push(`Undefined variable '${varName}'. Did you mean '${similar}'?`);
			} else {
				errors.push(`Undefined variable '${varName}'. Add to arguments or fix typo.`);
			}
		}
	}

	// Warning: unused arguments
	for (const argName of definedArgs.keys()) {
		if (!bodyVars.has(argName)) {
			warnings.push(`Argument '${argName}' defined but never used.`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
