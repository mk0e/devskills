"""MCP server for devskills - exposes skills as tools."""

from mcp.server.fastmcp import FastMCP

from .skills import SkillManager

mcp = FastMCP("devskills")
skills = SkillManager()


@mcp.tool()
def list_skills() -> list[dict]:
    """List all available skills with name and description.

    Call this tool FIRST when the user mentions 'devskills' or asks about available skills.
    Returns an array of {name, description} for each skill.

    After getting the list, if a skill matches the user's task:
    1. Call get_skill(name) to fetch the full instructions
    2. Follow the instructions in the skill
    """
    return skills.list_all()


@mcp.tool()
def get_skill(name: str) -> str:
    """Get the full instructions (SKILL.md content) for a skill.

    You MUST call list_skills() first to discover valid skill names.
    Returns the complete skill instructions including:
    - When to use the skill
    - Step-by-step instructions to follow
    - References to scripts and reference docs

    After fetching a skill:
    - Follow the instructions in the returned content
    - If instructions reference scripts, fetch them with get_script()
    - If instructions reference docs, fetch them with get_reference()
    """
    return skills.get_content(name)


@mcp.tool()
def get_script(skill: str, filename: str) -> str:
    """Get a script file from a skill's scripts/ folder.

    Only call this when a skill's instructions explicitly reference a script.
    The skill parameter must be a valid skill name from list_skills().
    The filename should match what's referenced in the skill instructions.

    Returns the raw script content. Execute it locally in your environment
    following the skill's instructions.
    """
    return skills.get_script(skill, filename)


@mcp.tool()
def get_reference(skill: str, filename: str) -> str:
    """Get a reference document from a skill's references/ folder.

    Only call this when a skill's instructions explicitly reference a doc.
    The skill parameter must be a valid skill name from list_skills().
    The filename should match what's referenced in the skill instructions.

    Returns reference documentation to inform how you complete the task.
    Read and apply this reference when following the skill's instructions.
    """
    return skills.get_reference(skill, filename)


def run():
    """Run the MCP server with stdio transport."""
    mcp.run(transport="stdio")
