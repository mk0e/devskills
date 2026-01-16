/**
 * Git source handling for remote skill repositories.
 */

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
