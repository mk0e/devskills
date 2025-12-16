#!/usr/bin/env node

/**
 * Command-line interface for devskills MCP server.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";

import { runServer } from "./index.js";
import {
	GITIGNORE_TEMPLATE,
	PROMPTS_GITKEEP,
	README_TEMPLATE,
	SKILLS_GITKEEP,
} from "./templates/repoTemplate.js";
import { generateSkillMd } from "./templates/skillTemplate.js";
import { validateSkill } from "./validation.js";
import { VERSION } from "./version.js";

const program = new Command();

program
	.name("devskills")
	.description("DevSkills - Reusable AI coding agent skills via MCP")
	.version(VERSION)
	.option(
		"-s, --skills-path <paths...>",
		"Additional skills directories (can be specified multiple times)",
	)
	.option("--no-bundled", "Disable bundled default skills")
	.action(async (options: { skillsPath?: string[]; bundled: boolean }) => {
		// Default action: run MCP server
		await runServer(options.skillsPath, options.bundled);
	});

program
	.command("init [path]")
	.description("Initialize a team skills repository")
	.option("-n, --name <name>", "Repository name (defaults to directory name)")
	.option("-f, --force", "Overwrite existing files")
	.action(
		async (
			pathArg: string | undefined,
			options: { name?: string; force?: boolean },
		) => {
			const targetPath = resolve(pathArg ?? ".");

			// Create directory if it doesn't exist
			if (!existsSync(targetPath)) {
				mkdirSync(targetPath, { recursive: true });
				console.log(`Created directory: ${targetPath}`);
			}

			// Determine repo name
			const repoName =
				options.name ?? targetPath.split("/").pop() ?? "Team Skills";

			// Create skills directory
			const skillsDir = join(targetPath, "skills");
			if (!existsSync(skillsDir)) {
				mkdirSync(skillsDir);
				console.log("Created: skills/");
			}

			// Create .gitkeep in skills
			const skillsGitkeep = join(skillsDir, ".gitkeep");
			if (!existsSync(skillsGitkeep) || options.force) {
				writeFileSync(skillsGitkeep, SKILLS_GITKEEP);
			}

			// Create prompts directory
			const promptsDir = join(targetPath, "prompts");
			if (!existsSync(promptsDir)) {
				mkdirSync(promptsDir);
				console.log("Created: prompts/");
			}

			// Create .gitkeep in prompts
			const promptsGitkeep = join(promptsDir, ".gitkeep");
			if (!existsSync(promptsGitkeep) || options.force) {
				writeFileSync(promptsGitkeep, PROMPTS_GITKEEP);
			}

			// Create README
			const readmePath = join(targetPath, "README.md");
			if (!existsSync(readmePath) || options.force) {
				writeFileSync(readmePath, README_TEMPLATE.replace("{name}", repoName));
				console.log("Created: README.md");
			} else {
				console.log("Skipped: README.md (already exists)");
			}

			// Create .gitignore
			const gitignorePath = join(targetPath, ".gitignore");
			if (!existsSync(gitignorePath)) {
				writeFileSync(gitignorePath, GITIGNORE_TEMPLATE);
				console.log("Created: .gitignore");
			}

			console.log();
			console.log(`Initialized skills repository: ${targetPath}`);
			console.log();
			console.log("Next steps:");
			console.log(`  1. cd ${targetPath}`);
			console.log(
				"  2. git init && git add . && git commit -m 'Initial commit'",
			);
			console.log(
				"  3. Create your first skill: npx devskills init-skill my-skill --path ./skills",
			);
			console.log("  4. Push to your team's git remote");
		},
	);

program
	.command("init-skill <skillName>")
	.description("Create a new skill from template")
	.option("-p, --path <path>", "Directory to create the skill in", "./skills")
	.action(async (skillName: string, options: { path: string }) => {
		const basePath = resolve(options.path);

		// Check if base path exists
		if (!existsSync(basePath)) {
			console.error(`Error: Directory '${basePath}' does not exist.`);
			console.error(`Create it first with: mkdir -p ${basePath}`);
			process.exit(1);
		}

		// Validate skill name (hyphenated lowercase)
		if (!/^[a-z][a-z0-9-]*$/.test(skillName)) {
			console.error(
				"Error: Skill name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens.",
			);
			console.error("Example: my-skill, code-review, test-runner");
			process.exit(1);
		}

		const skillDir = join(basePath, skillName);

		// Check if skill already exists
		if (existsSync(skillDir)) {
			console.error(
				`Error: Skill '${skillName}' already exists at ${skillDir}`,
			);
			process.exit(1);
		}

		// Create skill directory structure
		mkdirSync(skillDir, { recursive: true });
		mkdirSync(join(skillDir, "scripts"));
		mkdirSync(join(skillDir, "references"));

		// Create SKILL.md from template
		const skillMdContent = generateSkillMd(skillName);
		writeFileSync(join(skillDir, "SKILL.md"), skillMdContent);

		console.log(`Created skill: ${skillName}`);
		console.log(`  ${skillDir}/`);
		console.log("  ├── SKILL.md");
		console.log("  ├── scripts/");
		console.log("  └── references/");
		console.log();
		console.log("Next steps:");
		console.log(`  1. Edit ${join(skillDir, "SKILL.md")} to define your skill`);
		console.log(
			"  2. Add scripts to scripts/ if your skill needs executable code",
		);
		console.log(
			"  3. Add reference docs to references/ for additional context",
		);
	});

program
	.command("validate-skill <skillPath>")
	.description("Validate a skill directory")
	.action(async (skillPath: string) => {
		const targetPath = resolve(skillPath);

		if (!existsSync(targetPath)) {
			console.error(`Error: Path '${targetPath}' does not exist.`);
			process.exit(1);
		}

		const result = validateSkill(targetPath);

		if (result.valid) {
			console.log(`✓ ${result.message}`);
			process.exit(0);
		} else {
			console.error(`✗ ${result.message}`);
			if (result.errors && result.errors.length > 1) {
				console.error("\nErrors:");
				for (const error of result.errors) {
					console.error(`  - ${error}`);
				}
			}
			process.exit(1);
		}
	});

program.parse();
