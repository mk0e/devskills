/**
 * Tests for validation utilities.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import dedent from "dedent";
import { validatePrompt } from "../../src/validation.js";

const TEST_DIR = join(tmpdir(), `devskills-validation-test-${Date.now()}`);

describe("validatePrompt", () => {
	beforeEach(() => {
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	it("returns valid for prompt with all variables defined", () => {
		const promptPath = join(TEST_DIR, "valid.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: valid
				description: Valid prompt
				arguments:
				  code:
				    description: Code to review
				---

				Review: {{code}}
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(true);
		expect(result.errors).toEqual([]);
		expect(result.warnings).toEqual([]);
	});

	it("returns error for undefined variable", () => {
		const promptPath = join(TEST_DIR, "undefined-var.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: undefined-var
				description: Test
				---

				Hello {{name}}
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.stringContaining("Undefined variable 'name'"),
		);
	});

	it("suggests similar variable name for typos", () => {
		const promptPath = join(TEST_DIR, "typo.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: typo
				description: Test
				arguments:
				  language:
				    description: Language
				---

				Review {{langauge}} code
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.stringMatching(/langauge.*Did you mean 'language'/),
		);
	});

	it("returns warning for unused argument", () => {
		const promptPath = join(TEST_DIR, "unused.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: unused
				description: Test
				arguments:
				  code:
				    description: Code
				  verbose:
				    description: Unused arg
				---

				Review: {{code}}
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(true);
		expect(result.warnings).toContainEqual(
			expect.stringContaining("verbose"),
		);
	});

	it("returns error for invalid type value", () => {
		const promptPath = join(TEST_DIR, "bad-type.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: bad-type
				description: Test
				arguments:
				  count:
				    type: integer
				    description: Count
				---

				Count: {{count}}
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.stringMatching(/Invalid type 'integer'/),
		);
	});

	it("returns warning for argument without description", () => {
		const promptPath = join(TEST_DIR, "no-desc.md");
		writeFileSync(
			promptPath,
			dedent`---
				name: no-desc
				description: Test
				arguments:
				  code: {}
				---

				{{code}}
			`,
		);

		const result = validatePrompt(promptPath);
		expect(result.valid).toBe(true);
		expect(result.warnings).toContainEqual(
			expect.stringContaining("code"),
		);
	});
});
