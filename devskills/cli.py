"""Command-line interface for devskills MCP server."""

import click
from pathlib import Path

from . import __version__
from .main import create_server


# Template content for init command
CLAUDE_MCP_JSON = """{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
"""

VSCODE_MCP_JSON = """{
  "servers": {
    "devskills": {
      "type": "stdio",
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
"""

CURSOR_MCP_JSON = """{
  "mcpServers": {
    "devskills": {
      "command": "uvx",
      "args": ["devskills", "--skills-path", "./skills"]
    }
  }
}
"""

README_TEMPLATE = """# {name}

Custom devskills for your team.

## Setup

1. Clone this repository
2. Your AI agent will automatically connect to devskills via the MCP configs

## Creating Skills

Ask your AI agent:
```
I want to create a new skill. Use devskills.
```

Or use the CLI:
```bash
uvx devskills init-skill my-skill --path ./skills
```

## Available Skills

| Skill | Description |
|-------|-------------|
| (add your skills here) | |

## Configuration

MCP configs are provided for:
- Claude Code (`.claude/mcp.json`)
- GitHub Copilot (`.vscode/mcp.json`)
- Cursor (`.cursor/mcp.json`)
"""

GITKEEP = "# Add your skills here\n"


@click.group(invoke_without_command=True)
@click.option(
    "--skills-path",
    "-s",
    multiple=True,
    type=click.Path(exists=True, file_okay=False, dir_okay=True, path_type=Path),
    help="Additional skills directory (can be specified multiple times)",
)
@click.option(
    "--no-bundled",
    is_flag=True,
    default=False,
    help="Disable bundled default skills",
)
@click.version_option(version=__version__, prog_name="devskills")
@click.pass_context
def main(ctx: click.Context, skills_path: tuple[Path, ...], no_bundled: bool) -> None:
    """DevSkills - Reusable AI coding agent skills via MCP.

    Run without a subcommand to start the MCP server:

    \b
        uvx devskills --skills-path ./skills

    Or use subcommands for other operations:

    \b
        devskills init          Initialize a team skills repository
        devskills init-skill    Create a new skill from template
    """
    # If no subcommand, run the server
    if ctx.invoked_subcommand is None:
        extra_paths = list(skills_path) if skills_path else None
        server = create_server(
            extra_paths=extra_paths,
            include_bundled=not no_bundled,
        )
        server.run(transport="stdio")


@main.command()
@click.argument("path", type=click.Path(path_type=Path), default=".")
@click.option(
    "--name",
    "-n",
    default=None,
    help="Repository name (defaults to directory name)",
)
@click.option(
    "--force",
    "-f",
    is_flag=True,
    default=False,
    help="Overwrite existing files",
)
def init(path: Path, name: str | None, force: bool) -> None:
    """Initialize a team skills repository.

    Creates the directory structure and MCP configs for a new skills repo.

    \b
    Example:
        devskills init                    # Initialize in current directory
        devskills init ./my-team-skills   # Initialize in specific directory
        devskills init -n "My Team"       # With custom name
    """
    path = path.resolve()

    # Create directory if it doesn't exist
    if not path.exists():
        path.mkdir(parents=True)
        click.echo(f"Created directory: {path}")

    # Determine repo name
    repo_name = name or path.name or "Team Skills"

    # Create skills directory
    skills_dir = path / "skills"
    if not skills_dir.exists():
        skills_dir.mkdir()
        click.echo(f"Created: skills/")

    # Create .gitkeep in skills
    gitkeep_path = skills_dir / ".gitkeep"
    if not gitkeep_path.exists() or force:
        gitkeep_path.write_text(GITKEEP)

    # Create MCP config directories and files
    configs = [
        (".claude", "mcp.json", CLAUDE_MCP_JSON),
        (".vscode", "mcp.json", VSCODE_MCP_JSON),
        (".cursor", "mcp.json", CURSOR_MCP_JSON),
    ]

    for dir_name, file_name, content in configs:
        config_dir = path / dir_name
        config_file = config_dir / file_name

        if not config_dir.exists():
            config_dir.mkdir()

        if not config_file.exists() or force:
            config_file.write_text(content)
            click.echo(f"Created: {dir_name}/{file_name}")
        else:
            click.echo(f"Skipped: {dir_name}/{file_name} (already exists)")

    # Create README
    readme_path = path / "README.md"
    if not readme_path.exists() or force:
        readme_path.write_text(README_TEMPLATE.format(name=repo_name))
        click.echo(f"Created: README.md")
    else:
        click.echo(f"Skipped: README.md (already exists)")

    # Create .gitignore
    gitignore_path = path / ".gitignore"
    if not gitignore_path.exists():
        gitignore_content = """# Python
__pycache__/
*.pyc
.venv/

# IDE
.idea/
*.swp

# OS
.DS_Store
"""
        gitignore_path.write_text(gitignore_content)
        click.echo(f"Created: .gitignore")

    click.echo()
    click.echo(f"Initialized skills repository: {path}")
    click.echo()
    click.echo("Next steps:")
    click.echo("  1. cd " + str(path))
    click.echo("  2. git init && git add . && git commit -m 'Initial commit'")
    click.echo("  3. Create your first skill: devskills init-skill my-skill --path ./skills")
    click.echo("  4. Push to your team's git remote")


@main.command("init-skill")
@click.argument("skill_name")
@click.option(
    "--path",
    "-p",
    type=click.Path(exists=True, file_okay=False, dir_okay=True, path_type=Path),
    default="./skills",
    help="Directory to create the skill in (default: ./skills)",
)
def init_skill(skill_name: str, path: Path) -> None:
    """Create a new skill from template.

    \b
    Example:
        devskills init-skill code-review
        devskills init-skill deployment --path ./my-skills
    """
    # Import the init_skill function from bundled skill-creator
    import sys
    from pathlib import Path as P

    bundled_skills = P(__file__).parent / "bundled_skills"
    init_script = bundled_skills / "skill-creator" / "scripts" / "init_skill.py"

    if not init_script.exists():
        click.echo("Error: skill-creator script not found", err=True)
        sys.exit(1)

    # Execute the init_skill script
    import subprocess
    result = subprocess.run(
        [sys.executable, str(init_script), skill_name, "--path", str(path)],
        capture_output=False,
    )
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
