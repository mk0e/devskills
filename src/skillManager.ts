/**
 * Skill discovery and management for devskills MCP server.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Skill metadata returned by listAll().
 */
export interface SkillInfo {
	name: string;
	description: string;
}

/**
 * Resolves a path, expanding ~ to home directory.
 */
function resolvePath(p: string): string {
	if (p.startsWith("~")) {
		return resolve(join(homedir(), p.slice(1)));
	}
	return resolve(p);
}

/**
 * Manages skill discovery and content retrieval.
 *
 * Skills are directories containing a SKILL.md file with YAML frontmatter.
 * Optional scripts/ and references/ subdirectories contain supporting files.
 *
 * Skill paths are configured via (in priority order):
 * 1. extraPaths parameter (from CLI --skills-path)
 * 2. DEVSKILLS_SKILLS_PATH env var (colon-separated paths)
 * 3. Bundled skills in the package (lowest priority, always included)
 *
 * Skills from higher priority sources override those with matching names.
 */
export class SkillManager {
	private skillPaths: string[] = [];
	private writablePaths: string[] = [];

	/**
	 * Initialize SkillManager with skill paths.
	 *
	 * @param extraPaths - Additional skill directories (highest priority).
	 * @param includeBundled - Whether to include bundled default skills.
	 */
	constructor(extraPaths?: string[], includeBundled: boolean = true) {
		// 1. Extra paths from CLI (highest priority)
		if (extraPaths) {
			for (const p of extraPaths) {
				const expanded = resolvePath(p);
				if (existsSync(expanded) && statSync(expanded).isDirectory()) {
					this.skillPaths.push(expanded);
					this.writablePaths.push(expanded);
				}
			}
		}

		// 2. DEVSKILLS_SKILLS_PATH env var (colon-separated)
		const envPaths = process.env.DEVSKILLS_SKILLS_PATH ?? "";
		for (const pathStr of envPaths.split(":")) {
			const trimmed = pathStr.trim();
			if (trimmed) {
				const p = resolvePath(trimmed);
				if (
					existsSync(p) &&
					statSync(p).isDirectory() &&
					!this.skillPaths.includes(p)
				) {
					this.skillPaths.push(p);
					this.writablePaths.push(p);
				}
			}
		}

		// 3. Bundled skills (lowest priority, always available)
		if (includeBundled) {
			const bundled = resolve(__dirname, "..", "bundled");
			if (existsSync(bundled) && statSync(bundled).isDirectory()) {
				this.skillPaths.push(bundled);
			}
		}
	}

	/**
	 * Return paths where new skills can be created.
	 *
	 * Returns only user-provided paths, not bundled skills directory.
	 */
	getWritablePaths(): string[] {
		return [...this.writablePaths];
	}

	/**
	 * Discover all available skills, with earlier paths taking priority.
	 *
	 * Skills are located in the skills/ subdirectory of each skill path.
	 *
	 * @returns Map of skill name to its directory path.
	 */
	private discoverSkills(): Map<string, string> {
		const skills = new Map<string, string>();

		// Process in reverse order so earlier paths (higher priority) override
		for (const repoPath of [...this.skillPaths].reverse()) {
			if (!existsSync(repoPath)) continue;

			// Look for skills in skills/ subdirectory
			const skillsDir = join(repoPath, "skills");
			if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory())
				continue;

			try {
				const items = readdirSync(skillsDir);
				for (const item of items) {
					// Skip directories starting with _
					if (item.startsWith("_")) continue;

					const itemPath = join(skillsDir, item);
					if (!statSync(itemPath).isDirectory()) continue;

					const skillFile = join(itemPath, "SKILL.md");
					if (existsSync(skillFile)) {
						skills.set(item, itemPath);
					}
				}
			} catch {
				// Ignore errors reading directory
			}
		}

		return skills;
	}

	/**
	 * Parse YAML frontmatter from SKILL.md content.
	 *
	 * @param content - Full content of SKILL.md file.
	 * @returns Parsed frontmatter (name, description, etc.)
	 */
	private parseFrontmatter(content: string): Record<string, unknown> {
		// Match frontmatter between --- markers
		const match = content.match(/^---\n([\s\S]*?)\n---/);
		if (!match) return {};

		try {
			return (yaml.load(match[1]) as Record<string, unknown>) ?? {};
		} catch {
			return {};
		}
	}

	/**
	 * Return list of all available skills with name and description.
	 *
	 * @returns Array of objects with 'name' and 'description' keys.
	 */
	listAll(): SkillInfo[] {
		const skills = this.discoverSkills();
		const result: SkillInfo[] = [];

		const sortedEntries = [...skills.entries()].sort(([a], [b]) =>
			a.localeCompare(b),
		);
		for (const [name, skillPath] of sortedEntries) {
			const skillFile = join(skillPath, "SKILL.md");

			try {
				const content = readFileSync(skillFile, "utf-8");
				const frontmatter = this.parseFrontmatter(content);
				result.push({
					name: (frontmatter.name as string) ?? name,
					description:
						(frontmatter.description as string) ?? "No description available",
				});
			} catch {
				result.push({
					name,
					description: "Unable to read skill description",
				});
			}
		}

		return result;
	}

	/**
	 * Return full SKILL.md content for a skill.
	 *
	 * @param name - Skill name to retrieve.
	 * @returns Full content of SKILL.md file.
	 * @throws Error if skill not found.
	 */
	getContent(name: string): string {
		const skills = this.discoverSkills();
		const skillPath = skills.get(name);

		if (!skillPath) {
			const available = [...skills.keys()].sort().join(", ");
			throw new Error(
				`Skill '${name}' not found. Available skills: ${available}`,
			);
		}

		const skillFile = join(skillPath, "SKILL.md");
		try {
			return readFileSync(skillFile, "utf-8");
		} catch (e) {
			throw new Error(
				`Error reading skill '${name}': ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	}

	/**
	 * Return content of a script file from a skill's scripts/ folder.
	 *
	 * @param skill - Skill name.
	 * @param filename - Script filename (e.g., 'hello.py').
	 * @returns Raw script content.
	 * @throws Error if skill or script not found.
	 */
	getScript(skill: string, filename: string): string {
		const skills = this.discoverSkills();
		const skillPath = skills.get(skill);

		if (!skillPath) {
			const available = [...skills.keys()].sort().join(", ");
			throw new Error(
				`Skill '${skill}' not found. Available skills: ${available}`,
			);
		}

		const scriptPath = join(skillPath, "scripts", filename);

		if (!existsSync(scriptPath)) {
			const scriptsDir = join(skillPath, "scripts");
			if (existsSync(scriptsDir) && statSync(scriptsDir).isDirectory()) {
				try {
					const availableScripts = readdirSync(scriptsDir).filter((f) => {
						const fPath = join(scriptsDir, f);
						return existsSync(fPath) && statSync(fPath).isFile();
					});
					if (availableScripts.length > 0) {
						throw new Error(
							`Script '${filename}' not found in skill '${skill}'. ` +
								`Available scripts: ${availableScripts.join(", ")}`,
						);
					}
				} catch (e) {
					if (e instanceof Error && e.message.includes("not found in skill")) {
						throw e;
					}
				}
			}
			throw new Error(
				`Script '${filename}' not found in skill '${skill}'. ` +
					`No scripts directory exists for this skill.`,
			);
		}

		try {
			return readFileSync(scriptPath, "utf-8");
		} catch (e) {
			throw new Error(
				`Error reading script '${filename}' from skill '${skill}': ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	}

	/**
	 * Return content of a reference document from a skill's references/ folder.
	 *
	 * @param skill - Skill name.
	 * @param filename - Reference filename (e.g., 'notes.md').
	 * @returns Reference document content.
	 * @throws Error if skill or reference file not found.
	 */
	getReference(skill: string, filename: string): string {
		const skills = this.discoverSkills();
		const skillPath = skills.get(skill);

		if (!skillPath) {
			const available = [...skills.keys()].sort().join(", ");
			throw new Error(
				`Skill '${skill}' not found. Available skills: ${available}`,
			);
		}

		const refPath = join(skillPath, "references", filename);

		if (!existsSync(refPath)) {
			const refsDir = join(skillPath, "references");
			if (existsSync(refsDir) && statSync(refsDir).isDirectory()) {
				try {
					const availableRefs = readdirSync(refsDir).filter((f) => {
						const fPath = join(refsDir, f);
						return existsSync(fPath) && statSync(fPath).isFile();
					});
					if (availableRefs.length > 0) {
						throw new Error(
							`Reference '${filename}' not found in skill '${skill}'. ` +
								`Available references: ${availableRefs.join(", ")}`,
						);
					}
				} catch (e) {
					if (e instanceof Error && e.message.includes("not found in skill")) {
						throw e;
					}
				}
			}
			throw new Error(
				`Reference '${filename}' not found in skill '${skill}'. ` +
					`No references directory exists for this skill.`,
			);
		}

		try {
			return readFileSync(refPath, "utf-8");
		} catch (e) {
			throw new Error(
				`Error reading reference '${filename}' from skill '${skill}': ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	}
}
