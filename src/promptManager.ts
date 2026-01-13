/**
 * Prompt discovery and management for skillkit MCP server.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { z } from "zod";
import { type PromptArguments, PromptArgumentsSchema } from "./schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Prompt metadata returned by listAll().
 */
export interface PromptInfo {
	name: string;
	description: string;
	arguments?: PromptArguments;
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
	 * @returns Array of objects with 'name', 'description', and optional 'arguments'.
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
				const promptName = (fm.name as string) ?? name;

				// Get merged arguments (frontmatter + auto-discovered)
				const mergedArgs = this.getMergedArguments(promptName);
				const hasArgs = Object.keys(mergedArgs).length > 0;

				result.push({
					name: promptName,
					description: (fm.description as string) ?? "",
					...(hasArgs ? { arguments: mergedArgs } : {}),
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

	/**
	 * Extract template variable names from prompt body.
	 *
	 * @param name - Prompt name to extract variables from.
	 * @returns Array of unique variable names found in {{var}} patterns.
	 */
	getTemplateVariables(name: string): string[] {
		const body = this.getBody(name);
		const matches = body.matchAll(/\{\{(\w+)\}\}/g);
		const vars = new Set<string>();
		for (const match of matches) {
			vars.add(match[1]);
		}
		return [...vars];
	}

	/**
	 * Get parsed arguments from prompt frontmatter.
	 *
	 * @param name - Prompt name to get arguments for.
	 * @returns Parsed arguments object, or empty object if none defined.
	 */
	getArguments(name: string): PromptArguments {
		const prompts = this.discoverPrompts();
		const promptPath = prompts.get(name);

		if (!promptPath) {
			const available = [...prompts.keys()].sort().join(", ");
			throw new Error(`Prompt '${name}' not found. Available: ${available}`);
		}

		const content = readFileSync(promptPath, "utf-8");
		const fm = this.parseFrontmatter(content);

		if (!fm.arguments) {
			return {};
		}

		const parsed = PromptArgumentsSchema.safeParse(fm.arguments);
		if (!parsed.success) {
			return {};
		}

		return parsed.data;
	}

	/**
	 * Get merged arguments from frontmatter and auto-discovered body variables.
	 * Frontmatter definitions take precedence. Body variables without frontmatter
	 * definition become required string arguments.
	 *
	 * @param name - Prompt name to get merged arguments for.
	 * @returns Merged arguments object.
	 */
	getMergedArguments(name: string): PromptArguments {
		const frontmatterArgs = this.getArguments(name);
		const bodyVars = this.getTemplateVariables(name);

		const merged: PromptArguments = { ...frontmatterArgs };

		for (const varName of bodyVars) {
			if (!(varName in merged)) {
				merged[varName] = {};
			}
		}

		return merged;
	}

	/**
	 * Build a Zod schema from merged arguments for MCP argsSchema.
	 *
	 * @param name - Prompt name to build schema for.
	 * @returns Zod raw shape for MCP argsSchema.
	 */
	buildArgsSchema(name: string): z.ZodRawShape {
		const mergedArgs = this.getMergedArguments(name);
		const shape: z.ZodRawShape = {};

		for (const [argName, argDef] of Object.entries(mergedArgs)) {
			let fieldSchema: z.ZodTypeAny;

			// Determine base type
			const argType = argDef.type ?? "string";
			switch (argType) {
				case "number":
					fieldSchema = z.number();
					break;
				case "boolean":
					fieldSchema = z.boolean();
					break;
				default:
					fieldSchema = z.string();
			}

			// Add description if present
			if (argDef.description) {
				fieldSchema = fieldSchema.describe(argDef.description);
			}

			// Make optional with default, or required
			if (argDef.default !== undefined) {
				fieldSchema = fieldSchema.default(argDef.default);
			} else if (argType === "boolean") {
				// Booleans without defaults are optional
				fieldSchema = fieldSchema.optional();
			} else {
				// Required - no default
			}

			shape[argName] = fieldSchema;
		}

		return shape;
	}

	/**
	 * Get prompt body with variables substituted.
	 *
	 * @param name - Prompt name.
	 * @param args - Arguments to substitute into template.
	 * @returns Body with {{var}} patterns replaced by argument values.
	 */
	getBodyWithArgs(name: string, args: Record<string, unknown>): string {
		let body = this.getBody(name);

		for (const [key, value] of Object.entries(args)) {
			const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
			body = body.replace(pattern, String(value));
		}

		return body;
	}
}
