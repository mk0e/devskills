/**
 * Tests for PromptManager - prompt discovery and content retrieval.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PromptManager } from "../../src/promptManager.js";
import dedent from "dedent";
import { z } from "zod";

const TEST_DIR = join(tmpdir(), `skillkit-prompts-test-${Date.now()}`);

function createTestPrompt(
	baseDir: string,
	promptName: string,
	frontmatter: { name?: string; description?: string } = {},
	body: string = "Prompt body content.",
): void {
	const promptsDir = join(baseDir, "prompts");
	mkdirSync(promptsDir, { recursive: true });

	const content = dedent`---
		name: ${frontmatter.name ?? promptName}
		description: ${frontmatter.description ?? "Test prompt description"}
		---

		${body}
	`;

	writeFileSync(join(promptsDir, `${promptName}.md`), content);
}

describe("PromptManager", () => {
	beforeEach(() => {
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	describe("prompt discovery", () => {
		it("discovers .md files in prompts/ subdirectory", () => {
			createTestPrompt(TEST_DIR, "test-prompt");
			createTestPrompt(TEST_DIR, "another-prompt");

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();
			const names = prompts.map((p) => p.name);

			expect(names).toContain("test-prompt");
			expect(names).toContain("another-prompt");
		});

		it("ignores non-.md files", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });

			writeFileSync(
				join(promptsDir, "valid.md"),
				dedent`---
					name: valid
					description: Valid prompt
					---

					Content.
				`,
			);
			writeFileSync(join(promptsDir, "invalid.txt"), "Not a prompt");
			writeFileSync(join(promptsDir, "also-invalid.yaml"), "name: nope");

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			expect(prompts).toHaveLength(1);
			expect(prompts[0].name).toBe("valid");
		});

		it("handles missing prompts/ subdirectory", () => {
			// TEST_DIR exists but has no prompts/ subdirectory
			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			expect(prompts).toEqual([]);
		});
	});

	describe("listAll", () => {
		it("returns name and description from frontmatter", () => {
			createTestPrompt(TEST_DIR, "test-prompt", {
				name: "test-prompt",
				description: "A test prompt for unit testing",
			});

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			const testPrompt = prompts.find((p) => p.name === "test-prompt");
			expect(testPrompt?.description).toBe("A test prompt for unit testing");
		});

		it("uses filename stem as fallback name", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "no-name-field.md"),
				dedent`---
					description: Has description but no name field
					---

					Content.
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			expect(prompts).toHaveLength(1);
			expect(prompts[0].name).toBe("no-name-field");
			expect(prompts[0].description).toBe("Has description but no name field");
		});

		it("handles empty description", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "minimal.md"),
				dedent`---
					name: minimal
					---

					Just content.
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			expect(prompts).toHaveLength(1);
			expect(prompts[0].name).toBe("minimal");
			expect(prompts[0].description).toBe("");
		});
	});

	describe("getBody", () => {
		it("returns content after frontmatter", () => {
			createTestPrompt(
				TEST_DIR,
				"test-prompt",
				{ name: "test-prompt", description: "desc" },
				"Use the test-skill skill exactly as written.",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const body = manager.getBody("test-prompt");

			expect(body).toBe("Use the test-skill skill exactly as written.");
		});

		it("throws for unknown prompt", () => {
			createTestPrompt(TEST_DIR, "real-prompt");

			const manager = new PromptManager([TEST_DIR], false);

			expect(() => manager.getBody("nonexistent")).toThrow(
				"Prompt 'nonexistent' not found",
			);
		});

		it("error message lists available prompts", () => {
			createTestPrompt(TEST_DIR, "prompt-a");
			createTestPrompt(TEST_DIR, "prompt-b");

			const manager = new PromptManager([TEST_DIR], false);

			expect(() => manager.getBody("nonexistent")).toThrow(/prompt-a/);
			expect(() => manager.getBody("nonexistent")).toThrow(/prompt-b/);
		});

		it("handles files without frontmatter", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "no-frontmatter.md"),
				"Just plain content.",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const body = manager.getBody("no-frontmatter");

			expect(body).toBe("Just plain content.");
		});
	});

	describe("path priority", () => {
		it("earlier paths override later paths", () => {
			const highPriority = join(TEST_DIR, "high");
			const lowPriority = join(TEST_DIR, "low");

			createTestPrompt(highPriority, "shared-prompt", {
				description: "High priority version",
			});
			createTestPrompt(lowPriority, "shared-prompt", {
				description: "Low priority version",
			});

			const manager = new PromptManager([highPriority, lowPriority], false);
			const prompts = manager.listAll();

			const shared = prompts.find((p) => p.name === "shared-prompt");
			expect(shared?.description).toBe("High priority version");
		});

		it("includes prompts from all paths", () => {
			const highPriority = join(TEST_DIR, "high");
			const lowPriority = join(TEST_DIR, "low");

			createTestPrompt(highPriority, "prompt-a");
			createTestPrompt(lowPriority, "prompt-b");

			const manager = new PromptManager([highPriority, lowPriority], false);
			const prompts = manager.listAll();
			const names = prompts.map((p) => p.name);

			expect(names).toContain("prompt-a");
			expect(names).toContain("prompt-b");
		});
	});

	describe("bundled prompts", () => {
		it("includes bundled prompts when flag is true", () => {
			const manager = new PromptManager(undefined, true);
			const prompts = manager.listAll();
			const names = prompts.map((p) => p.name);

			expect(names).toContain("skill-creator");
		});

		it("excludes bundled prompts when flag is false", () => {
			createTestPrompt(TEST_DIR, "user-prompt");

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();
			const names = prompts.map((p) => p.name);

			expect(names).not.toContain("skill-creator");
		});
	});

	describe("frontmatter parsing", () => {
		it("handles invalid YAML gracefully", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "bad-yaml.md"),
				`---
					name: [unclosed bracket
					description: broken
					---

					Content anyway.
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			// Should still discover the file, using filename as fallback
			expect(prompts).toHaveLength(1);
			expect(prompts[0].name).toBe("bad-yaml");
		});

		it("handles empty frontmatter block", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "empty-fm.md"),
				`---
					---

					Content after empty frontmatter.
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			expect(prompts).toHaveLength(1);
			expect(prompts[0].name).toBe("empty-fm");
			expect(prompts[0].description).toBe("");
		});
	});

	describe("template variable parsing", () => {
		it("extracts variable names from {{var}} syntax", () => {
			createTestPrompt(
				TEST_DIR,
				"template-prompt",
				{ name: "template-prompt", description: "Test" },
				"Review this {{language}} code:\n\n{{code}}",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const vars = manager.getTemplateVariables("template-prompt");

			expect(vars).toEqual(["language", "code"]);
		});

		it("returns empty array for prompts without variables", () => {
			createTestPrompt(TEST_DIR, "static-prompt");

			const manager = new PromptManager([TEST_DIR], false);
			const vars = manager.getTemplateVariables("static-prompt");

			expect(vars).toEqual([]);
		});

		it("deduplicates repeated variables", () => {
			createTestPrompt(
				TEST_DIR,
				"repeated-vars",
				{ name: "repeated-vars", description: "Test" },
				"{{name}} is {{name}}'s name",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const vars = manager.getTemplateVariables("repeated-vars");

			expect(vars).toEqual(["name"]);
		});
	});

	describe("arguments parsing", () => {
		it("parses arguments from frontmatter", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "with-args.md"),
				dedent`---
					name: with-args
					description: Test prompt with arguments
					arguments:
					  code:
					    description: The code to review
					  language:
					    description: Programming language
					    default: typescript
					  maxIssues:
					    type: number
					    description: Maximum issues to report
					    default: 10
					---

					Review this {{language}} code (max {{maxIssues}} issues):

					{{code}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const args = manager.getArguments("with-args");

			expect(args).toEqual({
				code: { description: "The code to review" },
				language: { description: "Programming language", default: "typescript" },
				maxIssues: { type: "number", description: "Maximum issues to report", default: 10 },
			});
		});

		it("returns empty object for prompts without arguments", () => {
			createTestPrompt(TEST_DIR, "no-args");

			const manager = new PromptManager([TEST_DIR], false);
			const args = manager.getArguments("no-args");

			expect(args).toEqual({});
		});
	});

	describe("getMergedArguments", () => {
		it("merges frontmatter args with auto-discovered body vars", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "merged.md"),
				dedent`---
					name: merged
					description: Test
					arguments:
					  language:
					    description: Programming language
					    default: typescript
					---

					Review {{language}} code: {{code}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const args = manager.getMergedArguments("merged");

			// language from frontmatter, code auto-discovered
			expect(args.language).toEqual({
				description: "Programming language",
				default: "typescript",
			});
			expect(args.code).toEqual({});
		});

		it("frontmatter takes precedence over auto-discovered", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "precedence.md"),
				dedent`---
					name: precedence
					description: Test
					arguments:
					  code:
					    description: Code to review
					    type: string
					---

					{{code}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const args = manager.getMergedArguments("precedence");

			expect(args.code).toEqual({
				description: "Code to review",
				type: "string",
			});
		});

		it("returns empty when no args and no variables", () => {
			createTestPrompt(TEST_DIR, "empty-args");

			const manager = new PromptManager([TEST_DIR], false);
			const args = manager.getMergedArguments("empty-args");

			expect(args).toEqual({});
		});
	});

	describe("buildArgsSchema", () => {
		it("builds Zod schema from merged arguments", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "schema-test.md"),
				dedent`---
					name: schema-test
					description: Test
					arguments:
					  code:
					    description: Code to review
					  language:
					    description: Language
					    default: typescript
					  maxIssues:
					    type: number
					    description: Max issues
					    default: 10
					  verbose:
					    type: boolean
					    description: Verbose output
					---

					{{code}} {{language}} {{maxIssues}} {{verbose}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const schemaShape = manager.buildArgsSchema("schema-test");
			const schema = z.object(schemaShape);

			// Required field (no default)
			expect(() => schema.parse({})).toThrow();
			expect(() => schema.parse({ code: "test" })).not.toThrow();

			// Optional with defaults
			const result = schema.parse({ code: "test" });
			expect(result.code).toBe("test");
			expect(result.language).toBe("typescript");
			expect(result.maxIssues).toBe(10);
			expect(result.verbose).toBeUndefined();

			// Type coercion
			const withNumber = schema.parse({ code: "test", maxIssues: 5 });
			expect(withNumber.maxIssues).toBe(5);
		});

		it("returns empty schema for prompts without arguments", () => {
			createTestPrompt(TEST_DIR, "no-schema");

			const manager = new PromptManager([TEST_DIR], false);
			const schemaShape = manager.buildArgsSchema("no-schema");
			const schema = z.object(schemaShape);

			expect(schema.parse({})).toEqual({});
		});
	});

	describe("substituteVariables", () => {
		it("substitutes {{var}} with provided values", () => {
			createTestPrompt(
				TEST_DIR,
				"substitute-test",
				{ name: "substitute-test", description: "Test" },
				"Review this {{language}} code:\n\n{{code}}",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const result = manager.getBodyWithArgs("substitute-test", {
				language: "TypeScript",
				code: "const x = 1;",
			});

			expect(result).toBe("Review this TypeScript code:\n\nconst x = 1;");
		});

		it("handles repeated variables", () => {
			createTestPrompt(
				TEST_DIR,
				"repeated-sub",
				{ name: "repeated-sub", description: "Test" },
				"{{name}} says {{name}} is great",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const result = manager.getBodyWithArgs("repeated-sub", { name: "Alice" });

			expect(result).toBe("Alice says Alice is great");
		});

		it("converts non-string values to string", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "types.md"),
				dedent`---
					name: types
					description: Test
					arguments:
					  count:
					    type: number
					  enabled:
					    type: boolean
					---

					Count: {{count}}, Enabled: {{enabled}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const result = manager.getBodyWithArgs("types", {
				count: 42,
				enabled: true,
			});

			expect(result).toBe("Count: 42, Enabled: true");
		});

		it("leaves unknown variables unchanged", () => {
			createTestPrompt(
				TEST_DIR,
				"unknown-var",
				{ name: "unknown-var", description: "Test" },
				"Hello {{name}} and {{unknown}}",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const result = manager.getBodyWithArgs("unknown-var", { name: "World" });

			expect(result).toBe("Hello World and {{unknown}}");
		});
	});

	describe("listAll with arguments", () => {
		it("includes arguments in PromptInfo", () => {
			const promptsDir = join(TEST_DIR, "prompts");
			mkdirSync(promptsDir, { recursive: true });
			writeFileSync(
				join(promptsDir, "with-info-args.md"),
				dedent`---
					name: with-info-args
					description: Test prompt
					arguments:
					  code:
					    description: Code to review
					---

					{{code}}
				`,
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			const prompt = prompts.find((p) => p.name === "with-info-args");
			expect(prompt?.arguments).toEqual({
				code: { description: "Code to review" },
			});
		});

		it("includes auto-discovered variables in arguments", () => {
			createTestPrompt(
				TEST_DIR,
				"auto-discovered",
				{ name: "auto-discovered", description: "Test" },
				"Hello {{name}}",
			);

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			const prompt = prompts.find((p) => p.name === "auto-discovered");
			expect(prompt?.arguments).toEqual({ name: {} });
		});

		it("returns undefined arguments for static prompts", () => {
			createTestPrompt(TEST_DIR, "static");

			const manager = new PromptManager([TEST_DIR], false);
			const prompts = manager.listAll();

			const prompt = prompts.find((p) => p.name === "static");
			expect(prompt?.arguments).toBeUndefined();
		});
	});
});
