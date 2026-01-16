import { describe, expect, it } from "vitest";
import { isGitUrl } from "../../src/gitSource.js";

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
});
