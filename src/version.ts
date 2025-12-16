/**
 * Package version, read from package.json.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
	readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

export const VERSION = packageJson.version as string;
