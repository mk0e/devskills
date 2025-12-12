# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-XX

### Added

- CLI with `--skills-path` option for specifying custom skill directories
- `--no-bundled` flag to disable bundled default skills
- `get_skill_paths()` MCP tool to query configured skill directories
- Support for multiple skill sources (CLI args, env vars, bundled)
- `DEVSKILLS_SKILLS_PATH` environment variable (colon-separated paths)
- Comprehensive documentation for team setup

### Changed

- Package restructured for PyPI distribution
- Skills now bundled inside the package (`devskills/bundled_skills/`)
- Server module renamed from `server` to `devskills`
- Installation via `uvx devskills` (no git clone needed)

### Deprecated

- `DEVSKILLS_LOCAL_SKILLS` environment variable (use `DEVSKILLS_SKILLS_PATH`)

## [0.1.0] - 2025-01-XX

### Added

- Initial MCP server implementation
- Four MCP tools: `list_skills`, `get_skill`, `get_script`, `get_reference`
- MCP resources for root-level reference documents
- Three bundled skills: `example`, `skill-creator`, `mcp-builder`
- Progressive loading pattern for skills
- Support for Claude Code, GitHub Copilot, and Cursor
