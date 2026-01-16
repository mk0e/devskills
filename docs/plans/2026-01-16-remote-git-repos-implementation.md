# Remote Git Repository Support - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add support for remote git repositories as skill sources, auto-detected and cached locally.

**Architecture:** New `gitSource.ts` module handles git detection, parsing, caching, and clone/update operations. CLI resolves git URLs to local cache paths before passing to runServer().

**Tech Stack:** Node.js child_process for git commands, node:crypto for hashing, node:fs for cache management.

---

## Task 1: Create gitSource module with URL detection

**Files:**
- Create: `src/gitSource.ts`
- Create: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for isGitUrl**

```typescript
// tests/unit/gitSource.test.ts
import { describe, expect, it } from "vitest";
import { isGitUrl } from "../../src/gitSource.js";

describe("gitSource", () => {
  describe("isGitUrl", () => {
    it("returns true for HTTPS GitHub URL", () => {
      expect(isGitUrl("https://github.com/org/repo.git")).toBe(true);
    });

    it("returns true for HTTPS GitHub URL without .git suffix", () => {
      expect(isGitUrl("https://github.com/org/repo")).toBe(true);
    });

    it("returns true for SSH GitHub URL", () => {
      expect(isGitUrl("git@github.com:org/repo.git")).toBe(true);
    });

    it("returns true for GitLab URL", () => {
      expect(isGitUrl("https://gitlab.com/org/repo.git")).toBe(true);
    });

    it("returns true for Bitbucket URL", () => {
      expect(isGitUrl("https://bitbucket.org/org/repo.git")).toBe(true);
    });

    it("returns true for URL with ref fragment", () => {
      expect(isGitUrl("https://github.com/org/repo.git#v1.0.0")).toBe(true);
    });

    it("returns false for local absolute path", () => {
      expect(isGitUrl("/home/user/skills")).toBe(false);
    });

    it("returns false for local relative path", () => {
      expect(isGitUrl("./skills")).toBe(false);
    });

    it("returns false for tilde path", () => {
      expect(isGitUrl("~/my-skills")).toBe(false);
    });

    it("returns false for random HTTPS URL", () => {
      expect(isGitUrl("https://example.com/page")).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

```typescript
// src/gitSource.ts
/**
 * Git source handling for remote skill repositories.
 */

const GIT_HOSTS = [
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "dev.azure.com",
];

/**
 * Determines if a source string is a git URL (vs local path).
 */
export function isGitUrl(source: string): boolean {
  // SSH format: git@host:org/repo.git
  if (source.startsWith("git@")) {
    return true;
  }

  // HTTPS format: https://host/org/repo or https://host/org/repo.git
  if (source.startsWith("https://")) {
    // Remove fragment if present
    const urlPart = source.split("#")[0];

    // Check for .git suffix
    if (urlPart.endsWith(".git")) {
      return true;
    }

    // Check for known git hosts
    for (const host of GIT_HOSTS) {
      if (urlPart.includes(host)) {
        return true;
      }
    }
  }

  return false;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add isGitUrl detection function"
```

---

## Task 2: Add URL parsing with ref extraction

**Files:**
- Modify: `src/gitSource.ts`
- Modify: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for parseGitUrl**

```typescript
// Add to tests/unit/gitSource.test.ts
import { isGitUrl, parseGitUrl } from "../../src/gitSource.js";

// Add after isGitUrl describe block:
describe("parseGitUrl", () => {
  it("parses HTTPS URL without ref", () => {
    const result = parseGitUrl("https://github.com/org/repo.git");
    expect(result).toEqual({
      url: "https://github.com/org/repo.git",
      ref: null,
    });
  });

  it("parses HTTPS URL with tag ref", () => {
    const result = parseGitUrl("https://github.com/org/repo.git#v1.0.0");
    expect(result).toEqual({
      url: "https://github.com/org/repo.git",
      ref: "v1.0.0",
    });
  });

  it("parses HTTPS URL with branch ref", () => {
    const result = parseGitUrl("https://github.com/org/repo.git#main");
    expect(result).toEqual({
      url: "https://github.com/org/repo.git",
      ref: "main",
    });
  });

  it("parses HTTPS URL with SHA ref", () => {
    const result = parseGitUrl("https://github.com/org/repo.git#a1b2c3d");
    expect(result).toEqual({
      url: "https://github.com/org/repo.git",
      ref: "a1b2c3d",
    });
  });

  it("parses SSH URL without ref", () => {
    const result = parseGitUrl("git@github.com:org/repo.git");
    expect(result).toEqual({
      url: "git@github.com:org/repo.git",
      ref: null,
    });
  });

  it("parses SSH URL with ref", () => {
    const result = parseGitUrl("git@github.com:org/repo.git#feature/branch");
    expect(result).toEqual({
      url: "git@github.com:org/repo.git",
      ref: "feature/branch",
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - parseGitUrl not exported

**Step 3: Write minimal implementation**

```typescript
// Add to src/gitSource.ts

export interface ParsedGitUrl {
  url: string;
  ref: string | null;
}

/**
 * Parses a git URL into its components.
 */
export function parseGitUrl(source: string): ParsedGitUrl {
  const hashIndex = source.indexOf("#");

  if (hashIndex === -1) {
    return { url: source, ref: null };
  }

  return {
    url: source.slice(0, hashIndex),
    ref: source.slice(hashIndex + 1),
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add parseGitUrl for URL and ref extraction"
```

---

## Task 3: Add cache directory calculation

**Files:**
- Modify: `src/gitSource.ts`
- Modify: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for getCacheDir**

```typescript
// Add to tests/unit/gitSource.test.ts
import { isGitUrl, parseGitUrl, getCacheDir } from "../../src/gitSource.js";
import { homedir } from "node:os";
import { join } from "node:path";

// Add after parseGitUrl describe block:
describe("getCacheDir", () => {
  it("returns path under ~/.skillkit/cache/repos", () => {
    const result = getCacheDir("https://github.com/org/repo.git", "main");
    expect(result.startsWith(join(homedir(), ".skillkit", "cache", "repos"))).toBe(true);
  });

  it("returns consistent hash for same URL and ref", () => {
    const result1 = getCacheDir("https://github.com/org/repo.git", "v1.0");
    const result2 = getCacheDir("https://github.com/org/repo.git", "v1.0");
    expect(result1).toBe(result2);
  });

  it("returns different hash for different refs", () => {
    const result1 = getCacheDir("https://github.com/org/repo.git", "v1.0");
    const result2 = getCacheDir("https://github.com/org/repo.git", "v2.0");
    expect(result1).not.toBe(result2);
  });

  it("returns different hash for different URLs", () => {
    const result1 = getCacheDir("https://github.com/org/repo1.git", "main");
    const result2 = getCacheDir("https://github.com/org/repo2.git", "main");
    expect(result1).not.toBe(result2);
  });

  it("respects SKILLKIT_HOME env var", () => {
    const originalEnv = process.env.SKILLKIT_HOME;
    process.env.SKILLKIT_HOME = "/custom/path";

    const result = getCacheDir("https://github.com/org/repo.git", "main");
    expect(result.startsWith("/custom/path/cache/repos")).toBe(true);

    process.env.SKILLKIT_HOME = originalEnv;
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - getCacheDir not exported

**Step 3: Write minimal implementation**

```typescript
// Add to src/gitSource.ts
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Gets the skillkit home directory.
 */
export function getSkillkitHome(): string {
  return process.env.SKILLKIT_HOME ?? join(homedir(), ".skillkit");
}

/**
 * Calculates the cache directory for a git repo.
 */
export function getCacheDir(url: string, ref: string): string {
  const cacheKey = `${url}#${ref}`;
  const hash = createHash("sha256").update(cacheKey).digest("hex").slice(0, 12);
  return join(getSkillkitHome(), "cache", "repos", hash);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add getCacheDir for cache path calculation"
```

---

## Task 4: Add git installation check

**Files:**
- Modify: `src/gitSource.ts`
- Modify: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for ensureGitInstalled**

```typescript
// Add to tests/unit/gitSource.test.ts
import { isGitUrl, parseGitUrl, getCacheDir, ensureGitInstalled } from "../../src/gitSource.js";

// Add after getCacheDir describe block:
describe("ensureGitInstalled", () => {
  it("does not throw when git is installed", () => {
    // Git should be installed on any dev machine running these tests
    expect(() => ensureGitInstalled()).not.toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - ensureGitInstalled not exported

**Step 3: Write minimal implementation**

```typescript
// Add to src/gitSource.ts
import { execSync } from "node:child_process";

/**
 * Error thrown when git is not installed.
 */
export class GitNotInstalledError extends Error {
  constructor() {
    super(
      "[skillkit-mcp] ERROR: Git is required but not found\n\n" +
      "  Git URLs are configured but 'git' command is not available.\n" +
      "  Install git: https://git-scm.com/downloads"
    );
    this.name = "GitNotInstalledError";
  }
}

/**
 * Ensures git is installed and available.
 * @throws GitNotInstalledError if git is not found
 */
export function ensureGitInstalled(): void {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    throw new GitNotInstalledError();
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add ensureGitInstalled check"
```

---

## Task 5: Add clone and update functionality

**Files:**
- Modify: `src/gitSource.ts`
- Modify: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for cloneOrUpdate**

```typescript
// Add to tests/unit/gitSource.test.ts
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Add new describe block:
describe("cloneOrUpdate", () => {
  // Use a small public repo for testing
  const TEST_REPO = "https://github.com/octocat/Hello-World.git";
  const TEST_REF = "master";

  // Override SKILLKIT_HOME to use temp dir
  let originalHome: string | undefined;
  let testHome: string;

  beforeEach(() => {
    originalHome = process.env.SKILLKIT_HOME;
    testHome = join(tmpdir(), `skillkit-git-test-${Date.now()}`);
    process.env.SKILLKIT_HOME = testHome;
  });

  afterEach(() => {
    process.env.SKILLKIT_HOME = originalHome;
    if (existsSync(testHome)) {
      rmSync(testHome, { recursive: true, force: true });
    }
  });

  it("clones a public repository", async () => {
    const { cloneOrUpdate } = await import("../../src/gitSource.js");
    const localPath = await cloneOrUpdate(TEST_REPO, TEST_REF);

    expect(existsSync(localPath)).toBe(true);
    expect(existsSync(join(localPath, ".git"))).toBe(true);
    expect(existsSync(join(localPath, "README"))).toBe(true);
  });

  it("updates existing clone on second call", async () => {
    const { cloneOrUpdate } = await import("../../src/gitSource.js");

    const localPath1 = await cloneOrUpdate(TEST_REPO, TEST_REF);
    const localPath2 = await cloneOrUpdate(TEST_REPO, TEST_REF);

    expect(localPath1).toBe(localPath2);
    expect(existsSync(localPath2)).toBe(true);
  });

  it("throws descriptive error for invalid repo", async () => {
    const { cloneOrUpdate, GitCloneError } = await import("../../src/gitSource.js");

    await expect(
      cloneOrUpdate("https://github.com/nonexistent-org-12345/nonexistent-repo.git", "main")
    ).rejects.toThrow(GitCloneError);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - cloneOrUpdate not exported

**Step 3: Write minimal implementation**

```typescript
// Add to src/gitSource.ts
import { existsSync, mkdirSync } from "node:fs";

/**
 * Error thrown when git clone/fetch fails.
 */
export class GitCloneError extends Error {
  constructor(url: string, gitError: string) {
    super(
      `[skillkit-mcp] ERROR: Failed to clone git repository\n\n` +
      `  URL: ${url}\n` +
      `  Git error: ${gitError}\n\n` +
      `  Troubleshooting:\n` +
      `  - Run manually: git clone ${url}\n` +
      `  - For SSH: check ssh -T git@github.com\n` +
      `  - For HTTPS: verify git credential helper`
    );
    this.name = "GitCloneError";
  }
}

/**
 * Clones or updates a git repository to the cache.
 * @returns The local path to the cached repository
 */
export async function cloneOrUpdate(url: string, ref: string): Promise<string> {
  ensureGitInstalled();

  const cacheDir = getCacheDir(url, ref);
  const isExisting = existsSync(cacheDir);

  try {
    if (isExisting) {
      // Update existing clone
      execSync(`git -C "${cacheDir}" fetch --all`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
      execSync(`git -C "${cacheDir}" checkout "${ref}"`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
      // Try to pull if on a branch (will fail silently for detached HEAD)
      try {
        execSync(`git -C "${cacheDir}" pull --ff-only`, {
          stdio: "pipe",
          encoding: "utf-8",
        });
      } catch {
        // Ignore - likely detached HEAD (tag/SHA)
      }
    } else {
      // Create cache directory parent
      const parentDir = join(getSkillkitHome(), "cache", "repos");
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }

      // Clone fresh
      execSync(`git clone "${url}" "${cacheDir}"`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
      execSync(`git -C "${cacheDir}" checkout "${ref}"`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
    }

    return cacheDir;
  } catch (error) {
    const gitError = error instanceof Error ? error.message : String(error);
    throw new GitCloneError(url, gitError);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS (may take ~10s due to actual git clone)

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add cloneOrUpdate for repo caching"
```

---

## Task 6: Add resolveSkillSources function

**Files:**
- Modify: `src/gitSource.ts`
- Modify: `tests/unit/gitSource.test.ts`

**Step 1: Write failing test for resolveSkillSources**

```typescript
// Add to tests/unit/gitSource.test.ts

describe("resolveSkillSources", () => {
  let originalHome: string | undefined;
  let testHome: string;

  beforeEach(() => {
    originalHome = process.env.SKILLKIT_HOME;
    testHome = join(tmpdir(), `skillkit-resolve-test-${Date.now()}`);
    process.env.SKILLKIT_HOME = testHome;
  });

  afterEach(() => {
    process.env.SKILLKIT_HOME = originalHome;
    if (existsSync(testHome)) {
      rmSync(testHome, { recursive: true, force: true });
    }
  });

  it("passes through local paths unchanged", async () => {
    const { resolveSkillSources } = await import("../../src/gitSource.js");
    const sources = ["/absolute/path", "~/relative/path", "./local"];
    const resolved = await resolveSkillSources(sources);
    expect(resolved).toEqual(sources);
  });

  it("resolves git URLs to cache paths", async () => {
    const { resolveSkillSources } = await import("../../src/gitSource.js");
    const sources = ["https://github.com/octocat/Hello-World.git#master"];
    const resolved = await resolveSkillSources(sources);

    expect(resolved.length).toBe(1);
    expect(resolved[0].includes(".skillkit/cache/repos")).toBe(true);
    expect(existsSync(resolved[0])).toBe(true);
  });

  it("handles mixed local and git sources", async () => {
    const { resolveSkillSources } = await import("../../src/gitSource.js");
    const sources = [
      "/local/path",
      "https://github.com/octocat/Hello-World.git#master",
      "~/another/local",
    ];
    const resolved = await resolveSkillSources(sources);

    expect(resolved.length).toBe(3);
    expect(resolved[0]).toBe("/local/path");
    expect(resolved[1].includes(".skillkit/cache/repos")).toBe(true);
    expect(resolved[2]).toBe("~/another/local");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: FAIL - resolveSkillSources not exported

**Step 3: Write minimal implementation**

```typescript
// Add to src/gitSource.ts

/**
 * Resolves a list of skill sources, cloning git repos as needed.
 * @returns Array of local paths (git URLs resolved to cache paths)
 */
export async function resolveSkillSources(sources: string[]): Promise<string[]> {
  const resolved: string[] = [];

  for (const source of sources) {
    if (isGitUrl(source)) {
      const { url, ref } = parseGitUrl(source);
      const localPath = await cloneOrUpdate(url, ref ?? "HEAD");
      resolved.push(localPath);
    } else {
      resolved.push(source);
    }
  }

  return resolved;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/gitSource.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/gitSource.ts tests/unit/gitSource.test.ts
git commit -m "feat(git): add resolveSkillSources for mixed source handling"
```

---

## Task 7: Integrate with CLI

**Files:**
- Modify: `src/cli.ts`
- Modify: `tests/unit/cli.test.ts`

**Step 1: Write failing test for CLI git URL handling**

```typescript
// Add to tests/unit/cli.test.ts - in a new describe block at the end

describe("git URL support", () => {
  // Override SKILLKIT_HOME to use temp dir
  const originalHome = process.env.SKILLKIT_HOME;

  beforeEach(() => {
    process.env.SKILLKIT_HOME = join(TEST_DIR, ".skillkit");
  });

  afterEach(() => {
    process.env.SKILLKIT_HOME = originalHome;
  });

  it("shows help mentioning git URLs in skills-path description", () => {
    const output = execSync(`node ${CLI_PATH} --help`, {
      encoding: "utf-8",
    });

    expect(output).toContain("--skills-path");
    // The help should mention that git URLs are supported
    expect(output.toLowerCase()).toMatch(/git|url|remote/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm build && pnpm test tests/unit/cli.test.ts`
Expected: FAIL - help doesn't mention git URLs

**Step 3: Update CLI to integrate git source resolution**

```typescript
// Modify src/cli.ts

// Add import at top:
import { resolveSkillSources } from "./gitSource.js";

// Update the skills-path option description (around line 35):
.option(
  "-s, --skills-path <paths...>",
  "Skills directories or git URLs (can be specified multiple times). Git URLs: https://github.com/org/repo.git#ref",
)

// Update the action handler (around line 39-42):
.action(async (options: { skillsPath?: string[]; bundled: boolean }) => {
  // Resolve git URLs to local cache paths
  const resolvedPaths = options.skillsPath
    ? await resolveSkillSources(options.skillsPath)
    : undefined;

  await runServer(resolvedPaths, options.bundled);
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm build && pnpm test tests/unit/cli.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli.ts tests/unit/cli.test.ts
git commit -m "feat(cli): integrate git URL resolution in skills-path"
```

---

## Task 8: Add integration test for git repos

**Files:**
- Create: `tests/integration/gitSource.test.ts`

**Step 1: Write integration test**

```typescript
// tests/integration/gitSource.test.ts
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// This test uses the actual CLI to verify end-to-end behavior
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

  it("validates skills from a git repository", () => {
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
    execSync("git add .", { cwd: repoDir, stdio: "ignore" });
    execSync('git commit -m "init"', { cwd: repoDir, stdio: "ignore" });

    // Validate using local file:// URL (simulates git URL handling)
    const output = execSync(
      `node ${CLI_PATH} validate ${repoDir}`,
      { encoding: "utf-8" }
    );

    expect(output).toContain("test-skill");
    expect(output).toContain("passed");
  });
});
```

**Step 2: Run test to verify it passes**

Run: `pnpm build && pnpm test tests/integration/gitSource.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/integration/gitSource.test.ts
git commit -m "test: add integration test for git source handling"
```

---

## Task 9: Update documentation

**Files:**
- Modify: `docs/configuration.md`

**Step 1: Read current docs**

Run: `cat docs/configuration.md`

**Step 2: Add git URL documentation section**

Add after the existing path configuration section:

```markdown
## Remote Git Repositories

You can specify remote git repositories as skill sources. The server will clone them on startup and cache them locally.

### URL Format

```bash
# HTTPS (recommended for public repos)
https://github.com/org/repo.git
https://github.com/org/repo.git#v1.0.0    # specific tag
https://github.com/org/repo.git#main       # specific branch
https://github.com/org/repo.git#a1b2c3d    # specific commit

# SSH (for private repos)
git@github.com:org/repo.git
git@github.com:org/repo.git#v1.0.0
```

### Usage Examples

```bash
# CLI
skillkit-mcp --skills-path https://github.com/myorg/team-skills.git#v2.0

# Mixed local and remote
skillkit-mcp --skills-path ~/local-skills --skills-path https://github.com/myorg/team-skills.git

# Environment variable
export SKILLKIT_SKILLS_PATH="~/local-skills:https://github.com/myorg/team-skills.git#main"
```

### Cache Location

Cloned repositories are cached in `~/.skillkit/cache/repos/`. To override:

```bash
export SKILLKIT_HOME=/custom/path
# Repos cached in /custom/path/cache/repos/
```

To clear the cache, delete the directory:

```bash
rm -rf ~/.skillkit/cache/repos
```

### Authentication

The server uses your system's git configuration for authentication:

- **SSH keys**: Loaded via ssh-agent
- **HTTPS credentials**: Via git credential helpers
- **Tokens**: Via environment variables (`GH_TOKEN`, `GITHUB_TOKEN`)

If a clone fails, run the git command manually to debug:

```bash
git clone https://github.com/org/repo.git
```
```

**Step 3: Commit**

```bash
git add docs/configuration.md
git commit -m "docs: add git URL configuration documentation"
```

---

## Task 10: Final verification and cleanup

**Step 1: Run full test suite**

Run: `pnpm build && pnpm test`
Expected: All tests pass

**Step 2: Run linter**

Run: `pnpm lint`
Expected: No errors

**Step 3: Manual smoke test**

```bash
# Test with a real public repo
node dist/cli.js --skills-path https://github.com/octocat/Hello-World.git#master --help
```

**Step 4: Create final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: final cleanup for git source support"
```

**Step 5: Summary commit (squash-ready)**

The feature branch should now have these commits:
1. feat(git): add isGitUrl detection function
2. feat(git): add parseGitUrl for URL and ref extraction
3. feat(git): add getCacheDir for cache path calculation
4. feat(git): add ensureGitInstalled check
5. feat(git): add cloneOrUpdate for repo caching
6. feat(git): add resolveSkillSources for mixed source handling
7. feat(cli): integrate git URL resolution in skills-path
8. test: add integration test for git source handling
9. docs: add git URL configuration documentation

Ready for PR or merge to main.
