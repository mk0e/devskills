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
			.describe("Script filename as referenced in skill instructions"),
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
			.describe("Reference filename as referenced in skill instructions"),
	})
	.strict();

export type GetSkillInput = z.infer<typeof GetSkillInputSchema>;
export type GetScriptInput = z.infer<typeof GetScriptInputSchema>;
export type GetReferenceInput = z.infer<typeof GetReferenceInputSchema>;
