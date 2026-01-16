// tests/integration/gitSource.test.ts
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const CLI_PATH = join(__dirname, "../../dist/cli.js");

describe("Git source integration", () => {
  let testDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    testDir = join(tmpdir(), `skillkit-git-integration-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    originalHome = process.env.SKILLKIT_HOME;
    process.env.SKILLKIT_HOME = join(testDir, ".skillkit");
  });

  afterEach(() => {
    process.env.SKILLKIT_HOME = originalHome;
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("validates skills from a local git repository", () => {
    // Create a local git repo with a skill for testing
    const repoDir = join(testDir, "test-repo");
    const skillsDir = join(repoDir, "skills", "test-skill");
    mkdirSync(skillsDir, { recursive: true });

    writeFileSync(
      join(skillsDir, "SKILL.md"),
      `---
name: test-skill
description: A test skill
---

# Test Skill

This is a test skill.
`
    );

    // Initialize as git repo
    execSync("git init", { cwd: repoDir, stdio: "ignore" });
    execSync('git config user.email "test@test.com"', { cwd: repoDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: repoDir, stdio: "ignore" });
    execSync("git add .", { cwd: repoDir, stdio: "ignore" });
    execSync('git commit -m "init"', { cwd: repoDir, stdio: "ignore" });

    // Validate using the repo path
    const output = execSync(
      `node ${CLI_PATH} validate ${repoDir}`,
      { encoding: "utf-8" }
    );

    expect(output).toContain("test-skill");
    expect(output).toContain("passed");
  });
});
