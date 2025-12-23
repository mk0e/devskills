/**
 * Integration tests for MCP server prompts.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import {
	cleanupTestDir,
	createPromptFixtures,
	createTestDir,
	setupClientServer,
} from "./fixtures.js";

describe("MCP Server Prompts", () => {
	let testDir: string;
	let client: Client;
	let cleanup: () => Promise<void>;

	beforeEach(async () => {
		testDir = createTestDir();
		createPromptFixtures(testDir);
		const setup = await setupClientServer(testDir);
		client = setup.client;
		cleanup = setup.cleanup;
	});

	afterEach(async () => {
		await cleanup();
		cleanupTestDir(testDir);
	});

	it("lists available prompts", async () => {
		const result = await client.listPrompts();

		expect(result.prompts).toBeDefined();
		expect(result.prompts.length).toBeGreaterThanOrEqual(3);

		const promptNames = result.prompts.map((p) => p.name);
		expect(promptNames).toContain("test-prompt");
		expect(promptNames).toContain("prompt-with-defaults");
		expect(promptNames).toContain("simple-prompt");

		const testPrompt = result.prompts.find((p) => p.name === "test-prompt");
		expect(testPrompt?.description).toBe("A test prompt with variables");

		const promptWithDefaults = result.prompts.find(
			(p) => p.name === "prompt-with-defaults",
		);
		expect(promptWithDefaults?.description).toBe(
			"A prompt with default argument values",
		);

		const simplePrompt = result.prompts.find(
			(p) => p.name === "simple-prompt",
		);
		expect(simplePrompt?.description).toBe(
			"A simple prompt with no arguments",
		);
	});

	it("getPrompt returns content with substituted variables", async () => {
		const result = await client.getPrompt({
			name: "test-prompt",
			arguments: { feature_name: "user-auth" },
		});

		expect(result.messages).toBeDefined();
		expect(result.messages.length).toBeGreaterThan(0);

		const message = result.messages[0];
		expect(message.role).toBe("user");
		const content = message.content as TextContent;
		expect(content.type).toBe("text");
		expect(content.text).toContain("Implement the user-auth feature");
	});

	it("getPrompt uses default values when arguments omitted", async () => {
		const result = await client.getPrompt({
			name: "prompt-with-defaults",
			arguments: {},
		});

		expect(result.messages).toBeDefined();
		expect(result.messages.length).toBeGreaterThan(0);

		const message = result.messages[0];
		expect(message.role).toBe("user");
		const content = message.content as TextContent;
		expect(content.type).toBe("text");
		expect(content.text).toContain("typescript");
		expect(content.text).toContain("functional");
	});

	it("getPrompt works with no arguments", async () => {
		const result = await client.getPrompt({
			name: "simple-prompt",
			arguments: {},
		});

		expect(result.messages).toBeDefined();
		expect(result.messages.length).toBeGreaterThan(0);

		const message = result.messages[0];
		expect(message.role).toBe("user");
		const content = message.content as TextContent;
		expect(content.type).toBe("text");
		expect(content.text).toContain(
			"This is a simple prompt with no template variables",
		);
	});

	it("getPrompt returns error for unknown prompt", async () => {
		await expect(
			client.getPrompt({
				name: "nonexistent",
				arguments: {},
			}),
		).rejects.toThrow();
	});
});
