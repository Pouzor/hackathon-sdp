import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Config files (vite, tailwind) are not in tsconfig.json scope — skip type-checked lint
  { ignores: ["dist", "coverage", "vite.config.ts", "tailwind.config.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Allow numbers/strings in template literals (too noisy for this codebase)
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: false,
          allowNullish: false,
        },
      ],
      // Allow dynamic property deletion where needed
      "@typescript-eslint/no-dynamic-delete": "off",
      // Allow spread on arrays/objects in pre-existing code
      "@typescript-eslint/no-misused-spread": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**/*"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);
