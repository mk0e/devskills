/**
 * Tests for MCP server prompt registration with arguments.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import dedent from "dedent";
import { z } from "zod";
import { PromptManager } from "../../src/index.js";

const TEST_DIR = join(tmpdir(), `devskills-server-test-${Date.now()}`);

describe("createServer prompts", () => {
	beforeEach(() => {
		mkdirSync(join(TEST_DIR, "prompts"), { recursive: true });
	});

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	it("registers prompts with argsSchema from merged arguments", () => {
		writeFileSync(
			join(TEST_DIR, "prompts", "code-review.md"),
			dedent`---
				name: code-review
				description: Review code
				arguments:
				  language:
				    description: Programming language
				    default: typescript
				---

				Review this {{language}} code: {{code}}
			`,
		);

		// Test via PromptManager since server internals are private
		const prompts = new PromptManager([TEST_DIR], false);
		const schemaShape = prompts.buildArgsSchema("code-review");
		const schema = z.object(schemaShape);

		// code is required (no default)
		expect(() => schema.parse({})).toThrow();
		expect(() => schema.parse({ code: "test" })).not.toThrow();

		// language has default value
		const parsed = schema.parse({ code: "test" });
		expect(parsed.language).toBe("typescript");
		expect(parsed.code).toBe("test");
	});

	it("substitutes arguments when getting prompt", () => {
		writeFileSync(
			join(TEST_DIR, "prompts", "greet.md"),
			dedent`---
				name: greet
				description: Greet someone
				arguments:
				  name:
				    description: Name to greet
				---

				Hello, {{name}}!
			`,
		);

		// Test via PromptManager
		const prompts = new PromptManager([TEST_DIR], false);
		const result = prompts.getBodyWithArgs("greet", { name: "World" });

		expect(result).toBe("Hello, World!");
	});

	it("applies defaults for missing optional arguments", () => {
		writeFileSync(
			join(TEST_DIR, "prompts", "with-default.md"),
			dedent`---
				name: with-default
				description: Test defaults
				arguments:
				  greeting:
				    description: Greeting
				    default: Hello
				---

				{{greeting}}, friend!
			`,
		);

		// Test via PromptManager
		const prompts = new PromptManager([TEST_DIR], false);
		const schemaShape = prompts.buildArgsSchema("with-default");
		const schema = z.object(schemaShape);
		const parsed = schema.parse({});

		expect(parsed.greeting).toBe("Hello");

		const result = prompts.getBodyWithArgs("with-default", parsed);
		expect(result).toBe("Hello, friend!");
	});
});
