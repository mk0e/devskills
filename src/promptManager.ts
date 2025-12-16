/**
 * Prompt discovery and management for devskills MCP server.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Prompt metadata returned by listAll().
 */
export interface PromptInfo {
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
 * Manages prompt discovery and content retrieval.
 *
 * Prompts are markdown files with YAML frontmatter that define
 * user-triggered entry points to skills.
 */
export class PromptManager {
	private promptPaths: string[] = [];

	/**
	 * Initialize PromptManager with prompt paths.
	 *
	 * @param extraPaths - Additional directories containing prompts/ subdirectories.
	 * @param includeBundled - Whether to include bundled default prompts.
	 */
	constructor(extraPaths?: string[], includeBundled: boolean = true) {
		// 1. Extra paths from CLI (highest priority)
		if (extraPaths) {
			for (const p of extraPaths) {
				const expanded = resolvePath(p);
				const promptsDir = join(expanded, "prompts");
				if (existsSync(promptsDir) && statSync(promptsDir).isDirectory()) {
					this.promptPaths.push(promptsDir);
				}
			}
		}

		// 2. Bundled prompts (lowest priority)
		if (includeBundled) {
			const bundled = resolve(__dirname, "..", "bundled", "prompts");
			if (existsSync(bundled) && statSync(bundled).isDirectory()) {
				this.promptPaths.push(bundled);
			}
		}
	}

	/**
	 * Discover all available prompts.
	 *
	 * @returns Map of prompt name (filename stem) to its file path.
	 */
	private discoverPrompts(): Map<string, string> {
		const prompts = new Map<string, string>();

		// Process in reverse order so earlier paths (higher priority) override
		for (const promptsDir of [...this.promptPaths].reverse()) {
			if (!existsSync(promptsDir)) continue;

			try {
				const items = readdirSync(promptsDir);
				for (const item of items) {
					if (!item.endsWith(".md")) continue;

					const itemPath = join(promptsDir, item);
					if (!statSync(itemPath).isFile()) continue;

					// Use filename stem as name
					const name = item.slice(0, -3);
					prompts.set(name, itemPath);
				}
			} catch {
				// Ignore errors reading directory
			}
		}

		return prompts;
	}

	/**
	 * Parse YAML frontmatter from prompt file.
	 *
	 * @param content - Full content of the prompt markdown file.
	 * @returns Parsed frontmatter (name, description, etc.)
	 */
	private parseFrontmatter(content: string): Record<string, unknown> {
		const match = content.match(/^---\n([\s\S]*?)\n---/);
		if (!match) return {};

		try {
			return (yaml.load(match[1]) as Record<string, unknown>) ?? {};
		} catch {
			return {};
		}
	}

	/**
	 * Get content after frontmatter.
	 *
	 * @param content - Full content of the prompt markdown file.
	 * @returns Content after the YAML frontmatter, stripped of leading/trailing whitespace.
	 */
	private extractBody(content: string): string {
		const match = content.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)/);
		return match ? match[1].trim() : content.trim();
	}

	/**
	 * Return list of all prompts with metadata.
	 *
	 * @returns Array of objects with 'name' and 'description' keys.
	 */
	listAll(): PromptInfo[] {
		const prompts = this.discoverPrompts();
		const result: PromptInfo[] = [];

		const sortedEntries = [...prompts.entries()].sort(([a], [b]) =>
			a.localeCompare(b),
		);
		for (const [name, promptPath] of sortedEntries) {
			try {
				const content = readFileSync(promptPath, "utf-8");
				const fm = this.parseFrontmatter(content);
				result.push({
					name: (fm.name as string) ?? name,
					description: (fm.description as string) ?? "",
				});
			} catch {
				// Skip prompts we can't read
			}
		}

		return result;
	}

	/**
	 * Get prompt body content (after frontmatter).
	 *
	 * @param name - Prompt name to retrieve.
	 * @returns Prompt body content.
	 * @throws Error if prompt not found.
	 */
	getBody(name: string): string {
		const prompts = this.discoverPrompts();
		const promptPath = prompts.get(name);

		if (!promptPath) {
			const available = [...prompts.keys()].sort().join(", ");
			throw new Error(`Prompt '${name}' not found. Available: ${available}`);
		}

		const content = readFileSync(promptPath, "utf-8");
		return this.extractBody(content);
	}
}
