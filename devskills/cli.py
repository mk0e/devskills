"""Command-line interface for devskills MCP server."""

import click
from pathlib import Path

from . import __version__
from .main import create_server


@click.command()
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
def main(skills_path: tuple[Path, ...], no_bundled: bool) -> None:
    """Run the devskills MCP server.

    Exposes skills as tools for AI coding agents via the Model Context Protocol.

    Example usage in MCP config:

    \b
        {
          "mcpServers": {
            "devskills": {
              "command": "uvx",
              "args": ["devskills", "--skills-path", "./skills"]
            }
          }
        }
    """
    extra_paths = list(skills_path) if skills_path else None
    server = create_server(
        extra_paths=extra_paths,
        include_bundled=not no_bundled,
    )
    server.run(transport="stdio")


if __name__ == "__main__":
    main()
