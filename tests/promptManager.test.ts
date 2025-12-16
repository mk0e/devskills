/**
 * Tests for PromptManager - prompt discovery and content retrieval.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PromptManager } from "../src/promptManager.js";
import dedent from "dedent";

const TEST_DIR = join(tmpdir(), `devskills-prompts-test-${Date.now()}`);

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
});
