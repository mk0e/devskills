# Skill Repositories

A skill repository is a folder (typically a git repo) containing skills and prompts that SkillKit serves to your AI agent.

## Repository Structure

```
my-skills/
├── skills/           # Required: skill folders
│   ├── code-review/
│   │   └── SKILL.md
│   └── deployment/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── prompts/          # Optional: user-triggered prompts
│   └── review.md
├── README.md         # Recommended: describe your skills
└── .gitignore
```

- `skills/` - Each subfolder is a skill (must contain SKILL.md)
- `prompts/` - Markdown files that become slash commands
- Folders starting with `_` are ignored

## Creating a Repository

Use the CLI to scaffold a new repository:

```bash
npx skillkit-mcp init ~/my-skills
```

This creates the folder structure with a README and .gitignore.

To create inside an existing folder:

```bash
cd ~/existing-folder
npx skillkit-mcp init .
```

## Configuring SkillKit

### Default Location

With no configuration, SkillKit uses `~/.skillkit/` for personal skills:

```json
{ "args": ["skillkit-mcp"] }
```

### Custom Paths

Use `--skills-path` to specify repositories:

```json
{ "args": ["skillkit-mcp", "--skills-path", "~/my-skills"] }
```

### Multiple Sources

Combine multiple repositories:

```json
{ "args": ["skillkit-mcp", "--skills-path", "~/personal", "--skills-path", "~/team-skills"] }
```

Earlier paths take priority. If both repos have a `code-review` skill, the first one wins.

### Remote Git Repositories

Point directly to a git URL:

```json
{ "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git"] }
```

SkillKit clones the repo automatically to `~/.skillkit/cache/`.

### Version Pinning

Pin to a specific branch, tag, or commit:

```json
{ "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git#main"] }
```

```json
{ "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git#v1.0.0"] }
```

## Path Behavior

When you specify `--skills-path`, the default `~/.skillkit/` is **not** included. This gives you full control over which skills are available.

To include both personal and team skills:

```json
{ "args": ["skillkit-mcp", "--skills-path", "~/.skillkit", "--skills-path", "git@github.com:team/skills.git"] }
```

## Team Workflow

1. **Create a shared repository:**
   ```bash
   npx skillkit-mcp init ~/team-skills
   cd ~/team-skills
   git init
   git remote add origin git@github.com:your-org/skills.git
   ```

2. **Add skills:**
   ```bash
   npx skillkit-mcp init-skill code-review --path ~/team-skills/skills
   # Edit skills/code-review/SKILL.md
   ```

3. **Push to git:**
   ```bash
   git add . && git commit -m "Add code-review skill" && git push
   ```

4. **Team members configure:**
   ```json
   { "args": ["skillkit-mcp", "--skills-path", "git@github.com:your-org/skills.git"] }
   ```

## Validation

Before pushing, validate your skills:

```bash
npx skillkit-mcp validate ~/team-skills
```

This checks:
- Valid SKILL.md frontmatter
- Required fields (name, description)
- Correct naming conventions

## Best Practices

- **One repo per team** - Easier to manage permissions and reviews
- **Use PRs for changes** - Review skills like code
- **Pin versions in production** - Use tags for stability
- **Keep skills focused** - One task per skill
- **Document in README** - List available skills and their purposes
