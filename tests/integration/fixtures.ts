/**
 * Shared fixtures for integration tests.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import dedent from "dedent";
import { createServer } from "../../src/index.js";

/**
 * Create a unique temporary directory for tests.
 */
export function createTestDir(): string {
	const dir = join(tmpdir(), `skillkit-integration-${Date.now()}`);
	mkdirSync(dir, { recursive: true });
	return dir;
}

/**
 * Clean up a test directory.
 */
export function cleanupTestDir(dir: string): void {
	if (existsSync(dir)) {
		rmSync(dir, { recursive: true, force: true });
	}
}

/**
 * Create skill fixtures for testing.
 */
export function createSkillFixtures(baseDir: string): void {
	const skillsDir = join(baseDir, "skills");
	const testSkillDir = join(skillsDir, "test-skill");
	const anotherSkillDir = join(skillsDir, "another-skill");

	// test-skill with scripts and references
	mkdirSync(join(testSkillDir, "scripts"), { recursive: true });
	mkdirSync(join(testSkillDir, "references"), { recursive: true });

	writeFileSync(
		join(testSkillDir, "SKILL.md"),
		dedent`---
			name: test-skill
			description: A test skill for integration testing
			---

			# Test Skill

			This is a test skill with scripts and references.

			## Scripts
			- validate.sh

			## References
			- guide.md
		`,
	);

	writeFileSync(
		join(testSkillDir, "scripts", "validate.sh"),
		dedent`#!/bin/bash
			echo "Validating..."
			exit 0
		`,
	);

	writeFileSync(
		join(testSkillDir, "references", "guide.md"),
		dedent`# Guide

			This is a reference guide for the test skill.
		`,
	);

	// another-skill (minimal, for listing test)
	mkdirSync(anotherSkillDir, { recursive: true });
	writeFileSync(
		join(anotherSkillDir, "SKILL.md"),
		dedent`---
			name: another-skill
			description: Another test skill
			---

			# Another Skill

			Minimal skill for testing.
		`,
	);
}

/**
 * Create prompt fixtures for testing.
 */
export function createPromptFixtures(baseDir: string): void {
	const promptsDir = join(baseDir, "prompts");
	mkdirSync(promptsDir, { recursive: true });

	// Prompt with template variables
	writeFileSync(
		join(promptsDir, "test-prompt.md"),
		dedent`---
			name: test-prompt
			description: A test prompt with variables
			arguments:
			  feature_name:
			    description: Name of the feature
			---

			Implement the {{feature_name}} feature following best practices.
		`,
	);

	// Prompt with default values
	writeFileSync(
		join(promptsDir, "prompt-with-defaults.md"),
		dedent`---
			name: prompt-with-defaults
			description: A prompt with default argument values
			arguments:
			  language:
			    description: Programming language
			    default: typescript
			  style:
			    description: Code style
			    default: functional
			---

			Write {{language}} code in {{style}} style.
		`,
	);

	// Simple prompt with no arguments
	writeFileSync(
		join(promptsDir, "simple-prompt.md"),
		dedent`---
			name: simple-prompt
			description: A simple prompt with no arguments
			---

			This is a simple prompt with no template variables.
		`,
	);
}

/**
 * Set up a connected MCP client and server for testing.
 */
export async function setupClientServer(testDir: string): Promise<{
	client: Client;
	cleanup: () => Promise<void>;
}> {
	const server = createServer([testDir], false);
	const [clientTransport, serverTransport] =
		InMemoryTransport.createLinkedPair();

	await server.connect(serverTransport);
	const client = new Client({ name: "test-client", version: "1.0.0" });
	await client.connect(clientTransport);

	const cleanup = async () => {
		await client.close();
		await server.close();
	};

	return { client, cleanup };
}
