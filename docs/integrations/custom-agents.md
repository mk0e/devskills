# Custom Agents

SkillKit works with any agent framework that supports MCP (Model Context Protocol). This guide shows how to integrate SkillKit with popular frameworks.

## AWS Strands

[AWS Strands](https://strandsagents.com/) has native MCP support with automatic tool discovery.

### Installation

```bash
pip install strands-agents strands-agents-tools
```

### Basic Usage

```python
from strands import Agent
from strands.tools.mcp import MCPClient

# Connect to SkillKit
mcp = MCPClient(["npx", "skillkit-mcp"])

# Create agent with SkillKit tools
agent = Agent(tools=[mcp])

# Agent can now use skills
response = agent("Review this code according to team standards")
```

### With Custom Skill Paths

```python
mcp = MCPClient([
    "npx", "skillkit-mcp",
    "--skills-path", "~/team-skills",
    "--skills-path", "git@github.com:your-org/skills.git#main"
])
```

### Available Tools

Strands automatically discovers these SkillKit tools:

- `skillkit_list_skills` - List all available skills
- `skillkit_get_skill` - Get skill instructions (SKILL.md)
- `skillkit_get_script` - Fetch a script from a skill
- `skillkit_get_reference` - Fetch a reference document
- `skillkit_get_skill_paths` - Get writable skill paths

## LangChain

[LangChain](https://www.langchain.com/) supports MCP via the `langchain-mcp` package.

### Installation

```bash
pip install langchain langchain-mcp
```

### Basic Usage

```python
from langchain_mcp import MCPToolkit
from langchain.agents import create_tool_calling_agent

# Connect to SkillKit
toolkit = MCPToolkit(server_command=["npx", "skillkit-mcp"])
tools = toolkit.get_tools()

# Create agent with tools
agent = create_tool_calling_agent(llm, tools, prompt)
```

### With Custom Skill Paths

```python
toolkit = MCPToolkit(server_command=[
    "npx", "skillkit-mcp",
    "--skills-path", "~/team-skills"
])
```

## General MCP Integration

For other frameworks or custom implementations, use the MCP SDK directly.

### Python

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="npx",
        args=["skillkit-mcp"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List available tools
            tools = await session.list_tools()

            # Call a tool
            result = await session.call_tool(
                "skillkit_list_skills",
                arguments={}
            )
```

### TypeScript

```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["skillkit-mcp"]
});

const client = new Client({ name: "my-agent", version: "1.0.0" });
await client.connect(transport);

// List skills
const skills = await client.callTool("skillkit_list_skills", {});

// Get a specific skill
const skill = await client.callTool("skillkit_get_skill", {
  name: "code-review"
});
```

## Workflow Pattern

A typical workflow for using skills in custom agents:

```python
# 1. List available skills to understand capabilities
skills = await call_tool("skillkit_list_skills")

# 2. Based on user request, get relevant skill
skill = await call_tool("skillkit_get_skill", {"name": "code-review"})

# 3. If skill references scripts, fetch them
script = await call_tool("skillkit_get_script", {
    "skill": "code-review",
    "filename": "lint.sh"
})

# 4. If skill references docs, fetch them
reference = await call_tool("skillkit_get_reference", {
    "skill": "code-review",
    "filename": "style-guide.md"
})

# 5. Follow skill instructions to complete the task
```

## Tool Response Format

### skillkit_list_skills

Returns an array of available skills:

```json
[
  {"name": "code-review", "description": "Review code for issues"},
  {"name": "deploy", "description": "Deploy to production"}
]
```

### skillkit_get_skill

Returns the skill's SKILL.md content:

```json
{
  "name": "code-review",
  "content": "# Code Review\n\n## Instructions\n..."
}
```

### skillkit_get_script / skillkit_get_reference

Returns the file content:

```json
{
  "content": "#!/bin/bash\n..."
}
```

## Best Practices

### Use Claude 4.5 family

SkillKit skills are tested with Claude Sonnet 4.5 and Claude Opus 4.5. These models excel at:
- Discovering relevant skills from the list
- Following multi-step skill instructions
- Fetching scripts and references when needed
- Adapting skill guidance to specific contexts

### Let the LLM drive

Skills are designed for LLMs. Don't hardcode skill selection - let the model discover and choose skills based on the task.

### Cache skill list

The skill list rarely changes during a session. Cache it to reduce MCP calls.

### Handle missing skills gracefully

If a skill isn't found, the model can fall back to its general knowledge.

### Use skill paths for different environments

```python
# Development
mcp = MCPClient(["npx", "skillkit-mcp", "--skills-path", "~/dev-skills"])

# Production
mcp = MCPClient(["npx", "skillkit-mcp", "--skills-path", "git@github.com:org/skills.git#v1.0"])
```
