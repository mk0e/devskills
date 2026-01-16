# Remote Git Repository Support

## Overview

Add support for remote git repositories as skill sources, alongside existing local folder support. The server auto-detects source type and handles git operations transparently using the system's git installation.

## Configuration Format

Skill sources support both local paths and git URLs in a unified format:

```bash
# Local paths (existing behavior)
~/my-skills
/absolute/path/to/skills
./relative/path

# Git URLs (new)
https://github.com/org/repo.git
https://github.com/org/repo.git#main
https://github.com/org/repo.git#v1.0.0
https://github.com/org/repo.git#a1b2c3d
git@github.com:org/repo.git
git@github.com:org/repo.git#feature-branch
```

### Detection Logic

A source is treated as a git URL if it:
- Starts with `https://` and contains a git host (github.com, gitlab.com, bitbucket.org, etc.) or ends with `.git`
- Starts with `git@`

Everything else is treated as a local path.

### Usage Examples

```bash
# CLI
skillkit-mcp --skills-path ~/local-skills --skills-path https://github.com/org/repo.git#v1.0

# Environment variable
SKILLKIT_SKILLS_PATH="~/local-skills:https://github.com/org/repo.git#v1.0"

# MCP config (Claude Code, Cursor)
{
  "args": ["--skills-path", "~/local", "--skills-path", "https://github.com/org/repo.git#v2.0"]
}
```

### Git Ref (Fragment)

The URL fragment specifies the git ref to checkout:

- No fragment: defaults to `HEAD` (default branch)
- Tag: `#v1.0.0`
- Branch: `#main`, `#feature/xyz`
- Commit SHA: `#a1b2c3d` (full or short)

## Caching & Storage

### Cache Location

Repos are cloned to a `.skillkit` directory in the user's home:

```
~/.skillkit/
├── cache/
│   └── repos/
│       ├── a3f8b2c1e9d4/
│       └── b7e2f1a9c8d3/
└── config/              # future: global settings
```

This location is consistent across all platforms (macOS, Linux, Windows).

Override with environment variable:
```bash
SKILLKIT_HOME=~/custom/.skillkit
```

### Hash Generation

Each repo gets a unique directory based on URL + ref:

```
https://github.com/org/repo.git#v1.0.0
  → hash: sha256("https://github.com/org/repo.git#v1.0.0").slice(0, 12)
  → path: ~/.skillkit/cache/repos/a3f8b2c1e9d4/
```

### Update Behavior

On every startup:
1. If not cached: `git clone` + `git checkout <ref>`
2. If cached: `git fetch --all` + `git checkout <ref>`

Simple and consistent. Git handles tag/branch/SHA differences automatically.

## Git Operations & Authentication

### Approach

Shell out to the system `git` command. This automatically uses the user's existing git configuration:
- SSH keys via SSH agent
- Git credential helpers
- Environment tokens (`GH_TOKEN`, `GITHUB_TOKEN`)

### Commands

```bash
# Clone (if not cached)
git clone <url> <cache-dir>
git -C <cache-dir> checkout <ref>

# Update (if cached)
git -C <cache-dir> fetch --all
git -C <cache-dir> checkout <ref>
```

### Prerequisites

- `git` must be installed and available in PATH
- User must have access to the repository (existing git auth)

## Startup Flow & Error Handling

### Startup Sequence

```
1. Parse skill sources from CLI args / env var
2. For each source:
   a. Detect type (local path vs git URL)
   b. If git URL:
      - Check if cached in ~/.skillkit/cache/repos/<hash>/
      - If not cached: git clone
      - If cached: git fetch + checkout
   c. If local path:
      - Validate directory exists (existing behavior)
3. Pass all resolved paths to SkillManager
4. Start MCP server
```

### Error Handling (Fail Fast)

Any failure stops startup with a clear error to stderr:

```
[skillkit-mcp] ERROR: Failed to clone git repository

  URL: https://github.com/org/private-repo.git#main
  Git error: Permission denied (publickey)

  Troubleshooting:
  - Run manually: git clone https://github.com/org/private-repo.git
  - For SSH: check ssh -T git@github.com
  - For HTTPS: verify git credential helper

[skillkit-mcp] Server failed to start (exit code 1)
```

Git not installed:

```
[skillkit-mcp] ERROR: Git is required but not found

  Git URLs are configured but 'git' command is not available.
  Install git: https://git-scm.com/downloads
```

### Exit Codes

- `0` - Clean shutdown
- `1` - Startup failure (clone failed, git missing, invalid config)

## Implementation Changes

### New Module: `src/gitSource.ts`

Handles all git-related logic:

```typescript
// Core functions
isGitUrl(source: string): boolean
parseGitUrl(source: string): { url: string, ref: string | null }
getCacheDir(url: string, ref: string): string
cloneOrUpdate(url: string, ref: string): Promise<string>  // returns local path
ensureGitInstalled(): void
```

### Modified: `src/cli.ts`

Before passing paths to `runServer()`:
1. Resolve git URLs to local cache paths
2. Handle errors with clear messages

```typescript
async function resolveSkillSources(sources: string[]): Promise<string[]> {
  const resolved: string[] = [];
  for (const source of sources) {
    if (isGitUrl(source)) {
      const { url, ref } = parseGitUrl(source);
      const localPath = await cloneOrUpdate(url, ref ?? 'HEAD');
      resolved.push(localPath);
    } else {
      resolved.push(source);  // local path, pass through
    }
  }
  return resolved;
}
```

### Unchanged Modules

No changes needed to: `index.ts`, `skillManager.ts`, `promptManager.ts`, `schemas.ts`, `validation.ts`

### Dependencies

No new dependencies required. Uses:
- `node:child_process` for git commands
- `node:crypto` for hash generation
- `node:os` for home directory
- `node:fs` for cache directory management

## Future Considerations (Out of Scope)

1. **Subdirectory support** - `repo.git#main:path/to/skills`
2. **Enterprise skill registry** - Git-based central registry (this design is a foundation)
3. **Parallel cloning** - Clone multiple repos concurrently
4. **Cache management CLI** - `skillkit-mcp cache clear`, `cache list`
5. **Offline mode** - Skip fetch if no network (`--offline` flag)
6. **Shallow clones** - `--depth 1` optimization for pinned refs
