import { describe, expect, it } from "vitest";
import { isGitUrl, parseGitUrl } from "../../src/gitSource.js";

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
});
