import { tanstackConfig } from "@tanstack/eslint-config";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import-x";
import unused from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig(
	tanstackConfig,

	{ ignores: ["node_modules"] },
	{
		files: ["**/*.js", "**/*.ts", "**/*.tsx"],
		plugins: {
			import: importPlugin,
			"unused-imports": unused,
		},
		rules: {
			...prettier.rules,

			"@typescript-eslint/naming-convention": [
				"error",
				{
					selector: "typeParameter",
					format: ["PascalCase"],
				},
			],
		},
	},
);
