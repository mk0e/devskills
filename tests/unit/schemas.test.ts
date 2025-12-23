/**
 * Tests for Zod schemas.
 */

import { describe, expect, it } from "vitest";
import { PromptArgumentSchema } from "../../src/schemas.js";

describe("PromptArgumentSchema", () => {
	it("accepts minimal argument (description only)", () => {
		const result = PromptArgumentSchema.parse({
			description: "The code to review",
		});
		expect(result.description).toBe("The code to review");
		expect(result.type).toBeUndefined();
		expect(result.default).toBeUndefined();
	});

	it("accepts argument with type and default", () => {
		const result = PromptArgumentSchema.parse({
			type: "number",
			description: "Maximum issues",
			default: 10,
		});
		expect(result.type).toBe("number");
		expect(result.default).toBe(10);
	});

	it("accepts all valid types", () => {
		for (const type of ["string", "number", "boolean"]) {
			const result = PromptArgumentSchema.parse({
				description: "Test",
				type,
			});
			expect(result.type).toBe(type);
		}
	});

	it("rejects invalid type", () => {
		expect(() =>
			PromptArgumentSchema.parse({
				description: "Test",
				type: "integer",
			}),
		).toThrow();
	});

	it("accepts empty object (all optional)", () => {
		const result = PromptArgumentSchema.parse({});
		expect(result).toEqual({});
	});
});
