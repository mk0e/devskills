/**
 * Git source handling for remote skill repositories.
 */

import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ParsedGitUrl {
	url: string;
	ref: string | null;
}

/**
 * Parses a git URL into its components.
 * Splits on # to separate URL from ref.
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

/**
 * Determines if a source string is a git URL (vs local path).
 *
 * Simple detection rules:
 * - If source starts with `git@` -> it's a git URL
 * - If source starts with `https://` AND ends with `.git` (ignoring any #fragment) -> it's a git URL
 * - Everything else -> local path
 */
export function isGitUrl(source: string): boolean {
	// SSH format: git@host:org/repo.git
	if (source.startsWith("git@")) {
		return true;
	}

	// HTTPS format: must start with https:// and end with .git (ignoring fragment)
	if (source.startsWith("https://")) {
		// Remove fragment if present
		const urlPart = source.split("#")[0];

		// Check for .git suffix
		if (urlPart.endsWith(".git")) {
			return true;
		}
	}

	return false;
}

/**
 * Gets the skillkit home directory.
 * Defaults to ~/.skillkit, or uses SKILLKIT_HOME env var if set.
 */
export function getSkillkitHome(): string {
	return process.env.SKILLKIT_HOME ?? join(homedir(), ".skillkit");
}

/**
 * Calculates the cache directory for a git repo.
 * Uses SHA-256 hash of URL#ref to create a unique, deterministic path.
 */
export function getCacheDir(url: string, ref: string): string {
	const cacheKey = `${url}#${ref}`;
	const hash = createHash("sha256").update(cacheKey).digest("hex").slice(0, 12);
	return join(getSkillkitHome(), "cache", "repos", hash);
}
