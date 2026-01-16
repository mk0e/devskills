# Remote Repositories

SkillKit can load skills directly from git repositories, with automatic cloning and version pinning.

## Basic Usage

Point `--skills-path` to a git URL:

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git"]
}
```

SkillKit clones the repository to `~/.skillkit/cache/` and serves skills from there.

## Supported URL Formats

### SSH (recommended for private repos)

```
git@github.com:org/repo.git
git@gitlab.com:org/repo.git
```

### HTTPS (for public repos or with credentials)

```
https://github.com/org/repo.git
https://gitlab.com/org/repo.git
```

Note: HTTPS URLs must end with `.git` to be recognized as git URLs.

## Version Pinning

Append `#ref` to pin to a specific version:

### Branch

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:org/skills.git#main"]
}
```

### Tag

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:org/skills.git#v1.0.0"]
}
```

### Commit SHA

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:org/skills.git#a1b2c3d"]
}
```

Without a ref, SkillKit uses `HEAD` (default branch).

## How It Works

1. **First run**: SkillKit clones the repository to cache
2. **Subsequent runs**: SkillKit fetches updates and checks out the ref
3. **Cache location**: `~/.skillkit/cache/repos/<hash>/`

Each unique URL+ref combination gets its own cache directory.

## Combining Sources

Mix remote and local sources:

```json
{
  "args": [
    "skillkit-mcp",
    "--skills-path", "~/.skillkit",
    "--skills-path", "git@github.com:team/skills.git#main"
  ]
}
```

Priority: earlier paths override later ones. If both have a `code-review` skill, the local version wins.

## Authentication

### SSH Keys

For SSH URLs, SkillKit uses your system's SSH configuration:

```bash
# Test SSH access
ssh -T git@github.com
```

### HTTPS Credentials

For HTTPS URLs, configure git credential helper:

```bash
# Use system keychain
git config --global credential.helper osxkeychain  # macOS
git config --global credential.helper manager      # Windows
```

## Updating Skills

### Branch refs

When pinned to a branch (e.g., `#main`), SkillKit fetches the latest on each server start.

### Tag/commit refs

When pinned to a tag or commit, SkillKit uses exactly that version. Update by changing the ref in your config.

## Team Workflow

### Development

Pin to a development branch:

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:team/skills.git#develop"]
}
```

### Production

Pin to a release tag:

```json
{
  "args": ["skillkit-mcp", "--skills-path", "git@github.com:team/skills.git#v1.2.0"]
}
```

### Gradual Rollout

1. Create release tag: `git tag v1.3.0`
2. Test team pins to new tag
3. After validation, update production configs

## Troubleshooting

### Clone fails

```
[skillkit-mcp] ERROR: Failed to clone git repository
```

1. Check URL is correct
2. Verify access: `git clone <url>` manually
3. For SSH: check `ssh -T git@github.com`
4. For HTTPS: check credentials

### Repository not updating

1. SkillKit fetches on each start
2. For branches, ensure you're on the expected ref
3. Clear cache: `rm -rf ~/.skillkit/cache/repos/`

### Skills not found

1. Verify repo has `skills/` directory
2. Check SKILL.md exists in each skill folder
3. Run validation: `npx skillkit-mcp validate <local-clone>`

## Cache Management

Cache location: `~/.skillkit/cache/repos/`

Clear all cached repos:
```bash
rm -rf ~/.skillkit/cache/repos/
```

Repos are re-cloned on next server start.

## Best Practices

### Use tags for stability
Branches update automatically. Tags give you control over when to update.

### Document the ref in your team
Share which tag/branch everyone should use.

### Test before updating
Clone and validate locally before updating team configs.

### Keep repo structure clean
Follow the standard structure: `skills/`, `prompts/`, README.
