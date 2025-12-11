"""Skill discovery and management for devskills MCP server."""

import os
import re
from pathlib import Path

import yaml


class SkillManager:
    """Manages skill discovery and content retrieval.

    Skills are directories containing a SKILL.md file with YAML frontmatter.
    Optional scripts/ and references/ subdirectories contain supporting files.

    Skill paths are configured via:
    - DEVSKILLS_LOCAL_SKILLS env var (for user-defined skills)
    - Default: skills/ directory in the repo root

    Local skills override repo skills when names match.
    """

    def __init__(self) -> None:
        """Initialize SkillManager with skill paths from env + default."""
        self._skill_paths: list[Path] = []

        # Default skills directory (repo root / skills)
        repo_root = Path(__file__).parent.parent
        default_skills = repo_root / "skills"
        if default_skills.exists():
            self._skill_paths.append(default_skills)

        # Local skills from env var (takes precedence)
        local_skills_env = os.environ.get("DEVSKILLS_LOCAL_SKILLS")
        if local_skills_env:
            local_path = Path(local_skills_env).expanduser()
            if local_path.exists():
                self._skill_paths.insert(0, local_path)  # Local first for override

    def _discover_skills(self) -> dict[str, Path]:
        """Discover all available skills, with local overriding repo skills.

        Returns:
            Dict mapping skill name to its directory path.
        """
        skills: dict[str, Path] = {}

        # Process in reverse order so local (first in list) overrides repo
        for skills_dir in reversed(self._skill_paths):
            if not skills_dir.exists():
                continue
            for item in skills_dir.iterdir():
                if item.is_dir() and not item.name.startswith("_"):
                    skill_file = item / "SKILL.md"
                    if skill_file.exists():
                        skills[item.name] = item

        return skills

    def _parse_frontmatter(self, content: str) -> dict:
        """Parse YAML frontmatter from SKILL.md content.

        Args:
            content: Full content of SKILL.md file.

        Returns:
            Dict with parsed frontmatter (name, description, etc.)
        """
        # Match frontmatter between --- markers
        match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if not match:
            return {}

        try:
            return yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            return {}

    def list_all(self) -> list[dict]:
        """Return list of all available skills with name and description.

        Returns:
            List of dicts with 'name' and 'description' keys.
        """
        skills = self._discover_skills()
        result = []

        for name, path in sorted(skills.items()):
            skill_file = path / "SKILL.md"
            try:
                content = skill_file.read_text()
                frontmatter = self._parse_frontmatter(content)
                result.append({
                    "name": frontmatter.get("name", name),
                    "description": frontmatter.get("description", "No description available"),
                })
            except OSError:
                result.append({
                    "name": name,
                    "description": "Unable to read skill description",
                })

        return result

    def get_content(self, name: str) -> str:
        """Return full SKILL.md content for a skill.

        Args:
            name: Skill name to retrieve.

        Returns:
            Full content of SKILL.md file.

        Raises:
            ValueError: If skill not found.
        """
        skills = self._discover_skills()

        if name not in skills:
            available = ", ".join(sorted(skills.keys()))
            raise ValueError(
                f"Skill '{name}' not found. Available skills: {available}"
            )

        skill_file = skills[name] / "SKILL.md"
        try:
            return skill_file.read_text()
        except OSError as e:
            raise ValueError(f"Error reading skill '{name}': {e}")

    def get_script(self, skill: str, filename: str) -> str:
        """Return content of a script file from a skill's scripts/ folder.

        Args:
            skill: Skill name.
            filename: Script filename (e.g., 'hello.py').

        Returns:
            Raw script content.

        Raises:
            ValueError: If skill or script not found.
        """
        skills = self._discover_skills()

        if skill not in skills:
            available = ", ".join(sorted(skills.keys()))
            raise ValueError(
                f"Skill '{skill}' not found. Available skills: {available}"
            )

        script_path = skills[skill] / "scripts" / filename

        if not script_path.exists():
            scripts_dir = skills[skill] / "scripts"
            if scripts_dir.exists():
                available_scripts = [f.name for f in scripts_dir.iterdir() if f.is_file()]
                if available_scripts:
                    raise ValueError(
                        f"Script '{filename}' not found in skill '{skill}'. "
                        f"Available scripts: {', '.join(available_scripts)}"
                    )
            raise ValueError(
                f"Script '{filename}' not found in skill '{skill}'. "
                f"No scripts directory exists for this skill."
            )

        try:
            return script_path.read_text()
        except OSError as e:
            raise ValueError(f"Error reading script '{filename}' from skill '{skill}': {e}")

    def get_reference(self, skill: str, filename: str) -> str:
        """Return content of a reference document from a skill's references/ folder.

        Args:
            skill: Skill name.
            filename: Reference filename (e.g., 'notes.md').

        Returns:
            Reference document content.

        Raises:
            ValueError: If skill or reference file not found.
        """
        skills = self._discover_skills()

        if skill not in skills:
            available = ", ".join(sorted(skills.keys()))
            raise ValueError(
                f"Skill '{skill}' not found. Available skills: {available}"
            )

        ref_path = skills[skill] / "references" / filename

        if not ref_path.exists():
            refs_dir = skills[skill] / "references"
            if refs_dir.exists():
                available_refs = [f.name for f in refs_dir.iterdir() if f.is_file()]
                if available_refs:
                    raise ValueError(
                        f"Reference '{filename}' not found in skill '{skill}'. "
                        f"Available references: {', '.join(available_refs)}"
                    )
            raise ValueError(
                f"Reference '{filename}' not found in skill '{skill}'. "
                f"No references directory exists for this skill."
            )

        try:
            return ref_path.read_text()
        except OSError as e:
            raise ValueError(f"Error reading reference '{filename}' from skill '{skill}': {e}")
