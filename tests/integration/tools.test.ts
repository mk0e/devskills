/**
 * Integration tests for MCP server tools.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import {
	cleanupTestDir,
	createSkillFixtures,
	createTestDir,
	setupClientServer,
} from "./fixtures.js";

describe("MCP Server Tools", () => {
	let testDir: string;
	let client: Client;
	let cleanup: () => Promise<void>;

	beforeEach(async () => {
		testDir = createTestDir();
		createSkillFixtures(testDir);
		const setup = await setupClientServer(testDir);
		client = setup.client;
		cleanup = setup.cleanup;
	});

	afterEach(async () => {
		await cleanup();
		cleanupTestDir(testDir);
	});

	it("lists available tools", async () => {
		const result = await client.listTools();
		const toolNames = result.tools.map((tool) => tool.name);

		expect(toolNames).toContain("devskills_list_skills");
		expect(toolNames).toContain("devskills_get_skill");
		expect(toolNames).toContain("devskills_get_script");
		expect(toolNames).toContain("devskills_get_reference");
		expect(toolNames).toContain("devskills_get_skill_paths");
		expect(toolNames).toHaveLength(5);
	});

	it("devskills_list_skills returns skill metadata", async () => {
		const result = await client.callTool({
			name: "devskills_list_skills",
			arguments: {},
		});

		expect(result.isError).toBeFalsy();
		const content = result.content as TextContent[];
		expect(content).toHaveLength(1);
		expect(content[0].type).toBe("text");

		const skills = JSON.parse(content[0].text);
		expect(Array.isArray(skills)).toBe(true);
		expect(skills).toHaveLength(2);

		const testSkill = skills.find(
			(s: { name: string }) => s.name === "test-skill",
		);
		expect(testSkill).toBeDefined();
		expect(testSkill.description).toBe("A test skill for integration testing");

		const anotherSkill = skills.find(
			(s: { name: string }) => s.name === "another-skill",
		);
		expect(anotherSkill).toBeDefined();
		expect(anotherSkill.description).toBe("Another test skill");
	});

	it("devskills_get_skill returns SKILL.md content", async () => {
		const result = await client.callTool({
			name: "devskills_get_skill",
			arguments: { name: "test-skill" },
		});

		expect(result.isError).toBeFalsy();
		const content = result.content as TextContent[];
		expect(content).toHaveLength(1);
		expect(content[0].type).toBe("text");
		expect(content[0].text).toContain("# Test Skill");
		expect(content[0].text).toContain(
			"This is a test skill with scripts and references.",
		);
	});

	it("devskills_get_script returns script content", async () => {
		const result = await client.callTool({
			name: "devskills_get_script",
			arguments: { skill: "test-skill", filename: "validate.sh" },
		});

		expect(result.isError).toBeFalsy();
		const content = result.content as TextContent[];
		expect(content).toHaveLength(1);
		expect(content[0].type).toBe("text");
		expect(content[0].text).toContain("#!/bin/bash");
		expect(content[0].text).toContain('echo "Validating..."');
	});

	it("devskills_get_reference returns reference content", async () => {
		const result = await client.callTool({
			name: "devskills_get_reference",
			arguments: { skill: "test-skill", filename: "guide.md" },
		});

		expect(result.isError).toBeFalsy();
		const content = result.content as TextContent[];
		expect(content).toHaveLength(1);
		expect(content[0].type).toBe("text");
		expect(content[0].text).toContain("# Guide");
		expect(content[0].text).toContain(
			"This is a reference guide for the test skill.",
		);
	});

	it("devskills_get_skill_paths returns configured paths", async () => {
		const result = await client.callTool({
			name: "devskills_get_skill_paths",
			arguments: {},
		});

		expect(result.isError).toBeFalsy();
		const content = result.content as TextContent[];
		expect(content).toHaveLength(1);
		expect(content[0].type).toBe("text");

		const paths = JSON.parse(content[0].text);
		expect(Array.isArray(paths)).toBe(true);
		expect(paths).toContain(testDir);
	});

	it("devskills_get_skill returns error for unknown skill", async () => {
		const result = await client.callTool({
			name: "devskills_get_skill",
			arguments: { name: "nonexistent" },
		});

		expect(result.isError).toBe(true);
	});

	it("devskills_get_script returns error for missing script", async () => {
		const result = await client.callTool({
			name: "devskills_get_script",
			arguments: { skill: "test-skill", filename: "missing.sh" },
		});

		expect(result.isError).toBe(true);
	});
});
