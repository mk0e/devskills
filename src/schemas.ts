/**
 * Zod schemas for MCP tool input validation.
 */

import { z } from "zod";

/**
 * Input schema for getting a skill's full instructions.
 */
export const GetSkillInputSchema = z
	.object({
		name: z
			.string()
			.min(1, "Skill name is required")
			.describe("Skill name from list_skills() (e.g., 'mcp-builder')"),
	})
	.strict();

/**
 * Input schema for getting a script from a skill.
 */
export const GetScriptInputSchema = z
	.object({
		skill: z
			.string()
			.min(1, "Skill name is required")
			.describe("Skill name from list_skills()"),
		filename: z
			.string()
			.min(1, "Filename is required")
			.describe(
				"Script filename as referenced in skill instructions (e.g., 'setup.sh', 'init.ts')",
			),
	})
	.strict();

/**
 * Input schema for getting a reference doc from a skill.
 */
export const GetReferenceInputSchema = z
	.object({
		skill: z
			.string()
			.min(1, "Skill name is required")
			.describe("Skill name from list_skills()"),
		filename: z
			.string()
			.min(1, "Filename is required")
			.describe(
				"Reference filename as referenced in skill instructions (e.g., 'api-guide.md', 'config.json')",
			),
	})
	.strict();

export type GetSkillInput = z.infer<typeof GetSkillInputSchema>;
export type GetScriptInput = z.infer<typeof GetScriptInputSchema>;
export type GetReferenceInput = z.infer<typeof GetReferenceInputSchema>;

/**
 * Output schema for listing all skills.
 */
export const ListSkillsOutputSchema = z.object({
	skills: z
		.array(
			z.object({
				name: z
					.string()
					.describe("Skill identifier used with skillkit_get_skill()"),
				description: z.string().describe("Brief description of what the skill does"),
			}),
		)
		.describe("List of available skills"),
});

export type ListSkillsOutput = z.infer<typeof ListSkillsOutputSchema>;

/**
 * Output schema for getting writable skill paths.
 */
export const GetSkillPathsOutputSchema = z.object({
	paths: z
		.array(z.string())
		.describe("Directories where new skills can be created"),
});

export type GetSkillPathsOutput = z.infer<typeof GetSkillPathsOutputSchema>;

/**
 * Schema for a single prompt argument definition.
 */
export const PromptArgumentSchema = z.object({
	type: z.enum(["string", "number", "boolean"]).optional(),
	description: z.string().optional(),
	default: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export type PromptArgument = z.infer<typeof PromptArgumentSchema>;

/**
 * Schema for the arguments object in prompt frontmatter.
 */
export const PromptArgumentsSchema = z.record(z.string(), PromptArgumentSchema);

export type PromptArguments = z.infer<typeof PromptArgumentsSchema>;
