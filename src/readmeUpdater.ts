/**
 * Helper functions to update README.md skill index in skills repositories.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseSkillFrontmatter } from "./validation.js";
import { SKILLS_START_MARKER, SKILLS_END_MARKER } from "./templates/repoTemplate.js";

const DEFAULT_SKILLKIT_HOME = join(homedir(), ".skillkit");

interface SkillInfo {
	name: string;
	description: string;
}

/**
 * Check if a path is within the default ~/.skillkit directory.
 * We don't auto-update README for personal skills.
 */
export function isDefaultSkillkitHome(skillsPath: string): boolean {
	const resolved = resolve(skillsPath);
	const defaultHome = resolve(DEFAULT_SKILLKIT_HOME);
	return resolved.startsWith(defaultHome);
}

/**
 * Find the repository root README.md from a skills directory.
 * Looks for README.md in the parent of the skills/ directory.
 */
export function findRepoReadme(skillsDir: string): string | null {
	const resolved = resolve(skillsDir);

	// If we're in a skills/ directory, look in parent
	if (resolved.endsWith("/skills") || resolved.endsWith("\\skills")) {
		const parentDir = dirname(resolved);
		const readmePath = join(parentDir, "README.md");
		if (existsSync(readmePath)) {
			return readmePath;
		}
	}

	// Also check if README.md exists in the same directory (for flat structures)
	const readmePath = join(resolved, "..", "README.md");
	if (existsSync(readmePath)) {
		return readmePath;
	}

	return null;
}

/**
 * Get all skills from a skills directory with their metadata.
 */
export function getSkillsFromDirectory(skillsDir: string): SkillInfo[] {
	const skills: SkillInfo[] = [];

	if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) {
		return skills;
	}

	const items = readdirSync(skillsDir);
	for (const item of items) {
		if (item.startsWith(".")) continue;

		const skillPath = join(skillsDir, item);
		if (!statSync(skillPath).isDirectory()) continue;

		const skillMdPath = join(skillPath, "SKILL.md");
		if (!existsSync(skillMdPath)) continue;

		try {
			const content = readFileSync(skillMdPath, "utf-8");
			const frontmatter = parseSkillFrontmatter(content);

			if (frontmatter && frontmatter.name && frontmatter.description) {
				skills.push({
					name: frontmatter.name,
					description: frontmatter.description,
				});
			}
		} catch {
			// Skip skills with invalid SKILL.md
		}
	}

	// Sort alphabetically by name
	return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Generate the skills table markdown.
 */
function generateSkillsTable(skills: SkillInfo[]): string {
	const lines = [
		"| Skill | Description |",
		"|-------|-------------|",
	];

	for (const skill of skills) {
		// Escape pipe characters in description
		const escapedDesc = skill.description.replace(/\|/g, "\\|");
		lines.push(`| ${skill.name} | ${escapedDesc} |`);
	}

	return lines.join("\n");
}

/**
 * Update the skills section in a README.md file.
 * Returns true if the README was updated, false otherwise.
 */
export function updateReadmeSkillIndex(readmePath: string, skillsDir: string): boolean {
	if (!existsSync(readmePath)) {
		return false;
	}

	const content = readFileSync(readmePath, "utf-8");

	// Check if README has the markers
	if (!content.includes(SKILLS_START_MARKER) || !content.includes(SKILLS_END_MARKER)) {
		return false;
	}

	// Get all skills
	const skills = getSkillsFromDirectory(skillsDir);

	// Generate new table
	const newTable = generateSkillsTable(skills);

	// Replace content between markers
	const startIndex = content.indexOf(SKILLS_START_MARKER) + SKILLS_START_MARKER.length;
	const endIndex = content.indexOf(SKILLS_END_MARKER);

	const newContent =
		content.slice(0, startIndex) +
		"\n" + newTable + "\n" +
		content.slice(endIndex);

	// Only write if content changed
	if (newContent !== content) {
		writeFileSync(readmePath, newContent);
		return true;
	}

	return false;
}

/**
 * Update README after creating a skill.
 * Handles finding the README and updating the skill index.
 * Skips if the skill is in ~/.skillkit (personal skills).
 */
export function updateReadmeAfterSkillCreation(skillsDir: string): { updated: boolean; reason?: string } {
	// Skip for default skillkit home
	if (isDefaultSkillkitHome(skillsDir)) {
		return { updated: false, reason: "personal-skills" };
	}

	// Find README
	const readmePath = findRepoReadme(skillsDir);
	if (!readmePath) {
		return { updated: false, reason: "no-readme" };
	}

	// Update the index
	const updated = updateReadmeSkillIndex(readmePath, skillsDir);
	if (updated) {
		return { updated: true };
	}

	return { updated: false, reason: "no-markers" };
}
