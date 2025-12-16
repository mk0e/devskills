/**
 * Tests for CLI commands - init and init-skill.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const TEST_DIR = join(tmpdir(), `devskills-cli-test-${Date.now()}`);
const CLI_PATH = join(process.cwd(), "dist", "cli.js");
const packageJson = JSON.parse(
	readFileSync(join(process.cwd(), "package.json"), "utf-8"),
);

describe("CLI", () => {
	beforeEach(() => {
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	describe("init command", () => {
		it("creates directory structure", () => {
			const targetDir = join(TEST_DIR, "my-skills");

			execSync(`node ${CLI_PATH} init ${targetDir}`, { stdio: "pipe" });

			expect(existsSync(join(targetDir, "skills"))).toBe(true);
			expect(existsSync(join(targetDir, "prompts"))).toBe(true);
			expect(existsSync(join(targetDir, "README.md"))).toBe(true);
			expect(existsSync(join(targetDir, ".gitignore"))).toBe(true);
		});

		it("creates README with custom name", () => {
			const targetDir = join(TEST_DIR, "custom-name");

			execSync(`node ${CLI_PATH} init ${targetDir} --name "My Team Skills"`, {
				stdio: "pipe",
			});

			const readme = readFileSync(join(targetDir, "README.md"), "utf-8");
			expect(readme).toContain("# My Team Skills");
		});

		it("creates .gitkeep files in empty directories", () => {
			const targetDir = join(TEST_DIR, "with-gitkeep");

			execSync(`node ${CLI_PATH} init ${targetDir}`, { stdio: "pipe" });

			expect(existsSync(join(targetDir, "skills", ".gitkeep"))).toBe(true);
			expect(existsSync(join(targetDir, "prompts", ".gitkeep"))).toBe(true);
		});
	});

	describe("init-skill command", () => {
		it("creates skill directory structure", () => {
			const skillsDir = join(TEST_DIR, "skills");
			mkdirSync(skillsDir, { recursive: true });

			execSync(`node ${CLI_PATH} init-skill my-skill --path ${skillsDir}`, {
				stdio: "pipe",
			});

			const skillDir = join(skillsDir, "my-skill");
			expect(existsSync(join(skillDir, "SKILL.md"))).toBe(true);
			expect(existsSync(join(skillDir, "scripts"))).toBe(true);
			expect(existsSync(join(skillDir, "references"))).toBe(true);
		});

		it("creates SKILL.md with correct frontmatter", () => {
			const skillsDir = join(TEST_DIR, "skills");
			mkdirSync(skillsDir, { recursive: true });

			execSync(`node ${CLI_PATH} init-skill code-review --path ${skillsDir}`, {
				stdio: "pipe",
			});

			const skillMd = readFileSync(
				join(skillsDir, "code-review", "SKILL.md"),
				"utf-8",
			);
			expect(skillMd).toContain("name: code-review");
			expect(skillMd).toContain("# Code Review");
		});

		it("fails for invalid skill name", () => {
			const skillsDir = join(TEST_DIR, "skills");
			mkdirSync(skillsDir, { recursive: true });

			expect(() => {
				execSync(
					`node ${CLI_PATH} init-skill INVALID_NAME --path ${skillsDir}`,
					{ stdio: "pipe" },
				);
			}).toThrow();
		});

		it("fails if skill already exists", () => {
			const skillsDir = join(TEST_DIR, "skills");
			mkdirSync(join(skillsDir, "existing-skill"), { recursive: true });

			expect(() => {
				execSync(
					`node ${CLI_PATH} init-skill existing-skill --path ${skillsDir}`,
					{ stdio: "pipe" },
				);
			}).toThrow();
		});
	});

	describe("--help", () => {
		it("shows help message", () => {
			const output = execSync(`node ${CLI_PATH} --help`, {
				encoding: "utf-8",
			});

			expect(output).toContain("DevSkills");
			expect(output).toContain("--skills-path");
			expect(output).toContain("init");
			expect(output).toContain("init-skill");
		});
	});

	describe("--version", () => {
		it("shows version", () => {
			const output = execSync(`node ${CLI_PATH} --version`, {
				encoding: "utf-8",
			});

			expect(output.trim()).toBe(packageJson.version);
		});
	});
});
