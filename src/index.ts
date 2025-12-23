/**
 * MCP server for devskills - exposes skills as tools and prompts.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dedent from "dedent";
import { PromptManager } from "./promptManager.js";
import {
	GetReferenceInputSchema,
	GetScriptInputSchema,
	GetSkillInputSchema,
	GetSkillPathsOutputSchema,
	ListSkillsOutputSchema,
} from "./schemas.js";
import { SkillManager } from "./skillManager.js";
import { VERSION } from "./version.js";

/**
 * Create and configure the MCP server.
 *
 * @param extraPaths - Additional skill directories to include.
 * @param includeBundled - Whether to include bundled default skills and prompts.
 * @returns Configured McpServer instance.
 */
export function createServer(
	extraPaths?: string[],
	includeBundled: boolean = true,
): McpServer {
	const server = new McpServer({
		name: "devskills",
		version: VERSION,
	});

	const skills = new SkillManager(extraPaths, includeBundled);
	const prompts = new PromptManager(extraPaths, includeBundled);

	// Register tools

	// 1. devskills_list_skills
	server.registerTool(
		"devskills_list_skills",
		{
			title: "List DevSkills",
			description: dedent`
				List all available skills with name and description.

				Call this tool FIRST when the user mentions 'devskills' or asks about available skills.
				Returns an array of {name, description} for each skill.

				After getting the list, if a skill matches the user's task:
				1. Call devskills_get_skill(name) to fetch the full instructions
				2. Follow the instructions in the skill
			`,
			inputSchema: {},
			outputSchema: ListSkillsOutputSchema,
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async () => {
			const skillList = skills.listAll();
			return {
				content: [{ type: "text", text: JSON.stringify(skillList, null, 2) }],
				structuredContent: { skills: skillList },
			};
		},
	);

	// 2. devskills_get_skill
	server.registerTool(
		"devskills_get_skill",
		{
			title: "Get Skill Instructions",
			description: dedent`
				Fetch complete instructions for executing a skill.

				Requires: Call devskills_list_skills() first to discover valid skill names.
				Returns the complete skill instructions including:
				- When to use the skill
				- Step-by-step instructions to follow
				- References to scripts and reference docs

				After fetching a skill:
				- Follow the instructions in the returned content
				- If instructions reference scripts, fetch them with devskills_get_script()
				- If instructions reference docs, fetch them with devskills_get_reference()
			`,
			inputSchema: GetSkillInputSchema,
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ name }) => {
			try {
				const content = skills.getContent(name);
				return {
					content: [{ type: "text", text: content }],
				};
			} catch (e) {
				return {
					content: [
						{
							type: "text",
							text: `Error: ${e instanceof Error ? e.message : String(e)}`,
						},
					],
					isError: true,
				};
			}
		},
	);

	// 3. devskills_get_script
	server.registerTool(
		"devskills_get_script",
		{
			title: "Get Skill Script",
			description: dedent`
				Fetch a script file from a skill's scripts/ folder.

				Only call this when a skill's instructions explicitly reference a script.
				The skill parameter must be a valid skill name from devskills_list_skills().
				The filename should match what's referenced in the skill instructions.

				Returns the raw script content. Execute it locally in your environment
				following the skill's instructions.
			`,
			inputSchema: GetScriptInputSchema,
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ skill, filename }) => {
			try {
				const content = skills.getScript(skill, filename);
				return {
					content: [{ type: "text", text: content }],
				};
			} catch (e) {
				return {
					content: [
						{
							type: "text",
							text: `Error: ${e instanceof Error ? e.message : String(e)}`,
						},
					],
					isError: true,
				};
			}
		},
	);

	// 4. devskills_get_reference
	server.registerTool(
		"devskills_get_reference",
		{
			title: "Get Skill Reference",
			description: dedent`
				Fetch a reference document from a skill's references/ folder.

				Only call this when a skill's instructions explicitly reference a doc.
				The skill parameter must be a valid skill name from devskills_list_skills().
				The filename should match what's referenced in the skill instructions.

				Returns reference documentation to inform how you complete the task.
				Read and apply this reference when following the skill's instructions.
			`,
			inputSchema: GetReferenceInputSchema,
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ skill, filename }) => {
			try {
				const content = skills.getReference(skill, filename);
				return {
					content: [{ type: "text", text: content }],
				};
			} catch (e) {
				return {
					content: [
						{
							type: "text",
							text: `Error: ${e instanceof Error ? e.message : String(e)}`,
						},
					],
					isError: true,
				};
			}
		},
	);

	// 5. devskills_get_skill_paths
	server.registerTool(
		"devskills_get_skill_paths",
		{
			title: "Get Skill Paths",
			description: dedent`
				Return writable skill directories where new skills can be created.

				Returns paths configured via --skills-path or DEVSKILLS_SKILLS_PATH.
				Does NOT include the bundled skills directory (which is read-only).

				Use this to determine where to create new skills when using the
				skill-creator skill.
			`,
			inputSchema: {},
			outputSchema: GetSkillPathsOutputSchema,
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async () => {
			const paths = skills.getWritablePaths();
			return {
				content: [{ type: "text", text: JSON.stringify(paths, null, 2) }],
				structuredContent: { paths },
			};
		},
	);

	// Register prompts dynamically
	for (const promptInfo of prompts.listAll()) {
		const promptName = promptInfo.name;
		const promptDesc = promptInfo.description;

		// Build argsSchema and check if prompt has arguments
		const argsSchema = prompts.buildArgsSchema(promptName);
		const hasArgs = Object.keys(argsSchema).length > 0;

		// Helper to build the prompt response
		const buildResponse = (body: string) => {
			const contextNote = dedent`
				<!--
				MCP PROMPT: ${promptName}
				This prompt is already loaded into your context.
				Do NOT call devskills_get_skill("${promptName}") - it is not a skill.
				Proceed directly with the instructions below.
				-->

			`;
			return {
				messages: [
					{
						role: "user" as const,
						content: { type: "text" as const, text: contextNote + body },
					},
				],
			};
		};

		// MCP SDK callback signature differs based on argsSchema:
		// - With argsSchema: callback(args, extra) - first param is parsed args
		// - Without argsSchema: callback(extra) - no args param
		if (hasArgs) {
			server.registerPrompt(
				promptName,
				{ title: promptName, description: promptDesc, argsSchema },
				(args: Record<string, unknown>) =>
					buildResponse(prompts.getBodyWithArgs(promptName, args)),
			);
		} else {
			server.registerPrompt(
				promptName,
				{ title: promptName, description: promptDesc },
				() => buildResponse(prompts.getBody(promptName)),
			);
		}
	}

	return server;
}

/**
 * Run the MCP server with stdio transport.
 *
 * @param extraPaths - Additional skill directories to include.
 * @param includeBundled - Whether to include bundled default skills and prompts.
 */
export async function runServer(
	extraPaths?: string[],
	includeBundled: boolean = true,
): Promise<void> {
	const server = createServer(extraPaths, includeBundled);
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

export { PromptManager } from "./promptManager.js";
export * from "./schemas.js";
// Export classes and schemas for programmatic use
export { SkillManager } from "./skillManager.js";
