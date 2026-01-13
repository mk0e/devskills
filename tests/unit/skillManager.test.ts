/**
 * Tests for SkillManager - skill discovery and content retrieval.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SkillManager } from "../../src/skillManager.js";
import dedent from "dedent";

const TEST_DIR = join(tmpdir(), `skillkit-test-${Date.now()}`);

function createTestSkill(
	baseDir: string,
	skillName: string,
	frontmatter: { name?: string; description?: string } = {},
): void {
	// Skills are in the skills/ subdirectory
	const skillDir = join(baseDir, "skills", skillName);
	mkdirSync(skillDir, { recursive: true });

	const content = dedent`---
		name: ${frontmatter.name ?? skillName}
		description: ${frontmatter.description ?? "Test skill description"}
		---

		# ${skillName}

		Test skill content.
	`;

	writeFileSync(join(skillDir, "SKILL.md"), content);
}

describe("SkillManager", () => {
	beforeEach(() => {
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	describe("skill discovery", () => {
		it("discovers skills with SKILL.md files", () => {
			createTestSkill(TEST_DIR, "test-skill");

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills).toHaveLength(1);
			expect(skills[0].name).toBe("test-skill");
		});

		it("skips directories without SKILL.md", () => {
			mkdirSync(join(TEST_DIR, "skills", "not-a-skill"), { recursive: true });
			createTestSkill(TEST_DIR, "real-skill");

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills).toHaveLength(1);
			expect(skills[0].name).toBe("real-skill");
		});

		it("skips directories starting with underscore", () => {
			createTestSkill(TEST_DIR, "_hidden-skill");
			createTestSkill(TEST_DIR, "visible-skill");

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills).toHaveLength(1);
			expect(skills[0].name).toBe("visible-skill");
		});
	});

	describe("listAll", () => {
		it("returns name and description from frontmatter", () => {
			createTestSkill(TEST_DIR, "my-skill", {
				name: "my-skill",
				description: "Custom description",
			});

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills[0]).toEqual({
				name: "my-skill",
				description: "Custom description",
			});
		});

		it("uses directory name when frontmatter has no name", () => {
			const skillDir = join(TEST_DIR, "skills", "dir-name-skill");
			mkdirSync(skillDir, { recursive: true });
			writeFileSync(
				join(skillDir, "SKILL.md"),
				dedent`---
					description: Has description only
					---

					Content.
				`,
			);

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills[0].name).toBe("dir-name-skill");
			expect(skills[0].description).toBe("Has description only");
		});
	});

	describe("getContent", () => {
		it("returns full SKILL.md content", () => {
			createTestSkill(TEST_DIR, "test-skill");

			const manager = new SkillManager([TEST_DIR], false);
			const content = manager.getContent("test-skill");

			expect(content).toContain("# test-skill");
			expect(content).toContain("Test skill content.");
		});

		it("throws for unknown skill", () => {
			createTestSkill(TEST_DIR, "real-skill");

			const manager = new SkillManager([TEST_DIR], false);

			expect(() => manager.getContent("nonexistent")).toThrow(
				"Skill 'nonexistent' not found",
			);
		});

		it("error message lists available skills", () => {
			createTestSkill(TEST_DIR, "skill-a");
			createTestSkill(TEST_DIR, "skill-b");

			const manager = new SkillManager([TEST_DIR], false);

			expect(() => manager.getContent("nonexistent")).toThrow(/skill-a/);
			expect(() => manager.getContent("nonexistent")).toThrow(/skill-b/);
		});
	});

	describe("getScript", () => {
		it("returns script content", () => {
			createTestSkill(TEST_DIR, "test-skill");
			const scriptsDir = join(TEST_DIR, "skills", "test-skill", "scripts");
			mkdirSync(scriptsDir, { recursive: true });
			writeFileSync(join(scriptsDir, "helper.ts"), "console.log('hello');");

			const manager = new SkillManager([TEST_DIR], false);
			const script = manager.getScript("test-skill", "helper.ts");

			expect(script).toBe("console.log('hello');");
		});

		it("throws for unknown script", () => {
			createTestSkill(TEST_DIR, "test-skill");

			const manager = new SkillManager([TEST_DIR], false);

			expect(() => manager.getScript("test-skill", "missing.ts")).toThrow(
				"No scripts directory exists",
			);
		});

		it("lists available scripts in error", () => {
			createTestSkill(TEST_DIR, "test-skill");
			const scriptsDir = join(TEST_DIR, "skills", "test-skill", "scripts");
			mkdirSync(scriptsDir, { recursive: true });
			writeFileSync(join(scriptsDir, "exists.ts"), "code");

			const manager = new SkillManager([TEST_DIR], false);

			expect(() => manager.getScript("test-skill", "missing.ts")).toThrow(
				/exists.ts/,
			);
		});
	});

	describe("getReference", () => {
		it("returns reference content", () => {
			createTestSkill(TEST_DIR, "test-skill");
			const refsDir = join(TEST_DIR, "skills", "test-skill", "references");
			mkdirSync(refsDir, { recursive: true });
			writeFileSync(join(refsDir, "guide.md"), "# Guide\n\nContent.");

			const manager = new SkillManager([TEST_DIR], false);
			const ref = manager.getReference("test-skill", "guide.md");

			expect(ref).toBe("# Guide\n\nContent.");
		});

		it("throws for unknown reference", () => {
			createTestSkill(TEST_DIR, "test-skill");

			const manager = new SkillManager([TEST_DIR], false);

			expect(() => manager.getReference("test-skill", "missing.md")).toThrow(
				"No references directory exists",
			);
		});
	});

	describe("path priority", () => {
		it("earlier paths override later paths", () => {
			const highPriority = join(TEST_DIR, "high");
			const lowPriority = join(TEST_DIR, "low");
			mkdirSync(highPriority, { recursive: true });
			mkdirSync(lowPriority, { recursive: true });

			createTestSkill(highPriority, "shared-skill", {
				description: "High priority version",
			});
			createTestSkill(lowPriority, "shared-skill", {
				description: "Low priority version",
			});

			const manager = new SkillManager([highPriority, lowPriority], false);
			const skills = manager.listAll();

			expect(skills).toHaveLength(1);
			expect(skills[0].description).toBe("High priority version");
		});

		it("includes skills from all paths", () => {
			const highPriority = join(TEST_DIR, "high");
			const lowPriority = join(TEST_DIR, "low");
			mkdirSync(highPriority, { recursive: true });
			mkdirSync(lowPriority, { recursive: true });

			createTestSkill(highPriority, "skill-a");
			createTestSkill(lowPriority, "skill-b");

			const manager = new SkillManager([highPriority, lowPriority], false);
			const skills = manager.listAll();
			const names = skills.map((s) => s.name);

			expect(names).toContain("skill-a");
			expect(names).toContain("skill-b");
		});
	});

	describe("writable paths", () => {
		it("returns user-provided paths only", () => {
			const userPath = join(TEST_DIR, "user");
			mkdirSync(userPath, { recursive: true });

			const manager = new SkillManager([userPath], true);
			const writable = manager.getWritablePaths();

			expect(writable).toContain(userPath);
		});

		it("excludes bundled paths", () => {
			const manager = new SkillManager(undefined, true);
			const writable = manager.getWritablePaths();

			// Bundled path should not be in writable paths
			for (const p of writable) {
				expect(p).not.toMatch(/bundled$/);
			}
		});
	});

	describe("bundled skills", () => {
		it("includes bundled skills when flag is true", () => {
			const manager = new SkillManager(undefined, true);
			const skills = manager.listAll();
			const names = skills.map((s) => s.name);

			expect(names).toContain("skill-creator");
		});

		it("excludes bundled skills when flag is false", () => {
			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();
			const names = skills.map((s) => s.name);

			expect(names).not.toContain("skill-creator");
		});
	});

	describe("frontmatter parsing", () => {
		it("handles invalid YAML gracefully", () => {
			const skillDir = join(TEST_DIR, "skills", "bad-yaml-skill");
			mkdirSync(skillDir, { recursive: true });
			writeFileSync(
				join(skillDir, "SKILL.md"),
				dedent`---
					name: [unclosed bracket
					---

					Content.
				`,
			);

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			// Should still discover the skill, using directory name as fallback
			expect(skills).toHaveLength(1);
			expect(skills[0].name).toBe("bad-yaml-skill");
		});

		it("handles empty frontmatter", () => {
			const skillDir = join(TEST_DIR, "skills", "empty-fm-skill");
			mkdirSync(skillDir, { recursive: true });
			writeFileSync(
				join(skillDir, "SKILL.md"),
				dedent`---
					---

					Content.
				`,
			);

			const manager = new SkillManager([TEST_DIR], false);
			const skills = manager.listAll();

			expect(skills).toHaveLength(1);
			expect(skills[0].name).toBe("empty-fm-skill");
		});
	});
});
