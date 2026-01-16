import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	ensureGitInstalled,
	getCacheDir,
	getSkillkitHome,
	isGitUrl,
	parseGitUrl,
} from "../../src/gitSource.js";

describe("gitSource", () => {
	describe("isGitUrl", () => {
		// HTTPS URLs ending with .git
		it("returns true for HTTPS GitHub URL with .git suffix", () => {
			expect(isGitUrl("https://github.com/org/repo.git")).toBe(true);
		});

		it("returns true for HTTPS URL with .git suffix and fragment", () => {
			expect(isGitUrl("https://github.com/org/repo.git#v1.0")).toBe(true);
		});

		// SSH URLs starting with git@
		it("returns true for SSH GitHub URL", () => {
			expect(isGitUrl("git@github.com:org/repo.git")).toBe(true);
		});

		it("returns true for SSH URL with fragment", () => {
			expect(isGitUrl("git@github.com:org/repo.git#main")).toBe(true);
		});

		// Local paths - should return false
		it("returns false for local absolute path", () => {
			expect(isGitUrl("/home/user/skills")).toBe(false);
		});

		it("returns false for tilde path", () => {
			expect(isGitUrl("~/my-skills")).toBe(false);
		});

		it("returns false for local relative path", () => {
			expect(isGitUrl("./local")).toBe(false);
		});

		// HTTPS without .git suffix - should return false
		it("returns false for HTTPS URL without .git suffix", () => {
			expect(isGitUrl("https://example.com/page")).toBe(false);
		});
	});

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

		it("parses SSH URL without ref", () => {
			const result = parseGitUrl("git@github.com:org/repo.git");
			expect(result).toEqual({
				url: "git@github.com:org/repo.git",
				ref: null,
			});
		});

		it("parses SSH URL with feature branch ref", () => {
			const result = parseGitUrl("git@github.com:org/repo.git#feature/branch");
			expect(result).toEqual({
				url: "git@github.com:org/repo.git",
				ref: "feature/branch",
			});
		});
	});

	describe("getSkillkitHome", () => {
		let originalEnv: string | undefined;

		beforeEach(() => {
			originalEnv = process.env.SKILLKIT_HOME;
		});

		afterEach(() => {
			if (originalEnv === undefined) {
				delete process.env.SKILLKIT_HOME;
			} else {
				process.env.SKILLKIT_HOME = originalEnv;
			}
		});

		it("returns ~/.skillkit by default", () => {
			delete process.env.SKILLKIT_HOME;
			const result = getSkillkitHome();
			expect(result).toBe(join(homedir(), ".skillkit"));
		});

		it("respects SKILLKIT_HOME env var when set", () => {
			process.env.SKILLKIT_HOME = "/custom/skillkit/path";
			const result = getSkillkitHome();
			expect(result).toBe("/custom/skillkit/path");
		});
	});

	describe("getCacheDir", () => {
		let originalEnv: string | undefined;

		beforeEach(() => {
			originalEnv = process.env.SKILLKIT_HOME;
			delete process.env.SKILLKIT_HOME;
		});

		afterEach(() => {
			if (originalEnv === undefined) {
				delete process.env.SKILLKIT_HOME;
			} else {
				process.env.SKILLKIT_HOME = originalEnv;
			}
		});

		it("returns path under ~/.skillkit/cache/repos", () => {
			const result = getCacheDir("https://github.com/org/repo.git", "main");
			expect(
				result.startsWith(join(homedir(), ".skillkit", "cache", "repos")),
			).toBe(true);
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

		it("respects SKILLKIT_HOME env var when set", () => {
			process.env.SKILLKIT_HOME = "/custom/path";
			const result = getCacheDir("https://github.com/org/repo.git", "main");
			expect(result.startsWith("/custom/path/cache/repos")).toBe(true);
		});
	});

	describe("ensureGitInstalled", () => {
		it("does not throw when git is installed", () => {
			// Git should be installed on any dev machine running these tests
			expect(() => ensureGitInstalled()).not.toThrow();
		});
	});
});
