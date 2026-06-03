import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    // Only the `src` tree is part of the build; ignore generated/legacy trees.
    ignores: ["dist/**", "node_modules/**", "coverage/**", "src-prisma/**", "src-old/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Pragmatic relaxations while the existing codebase is brought up to the
      // linter: report these as warnings instead of failing the build. Tighten
      // over time as the issues are paid down.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "no-empty": "warn",
    },
  },
  // Disables stylistic rules that would conflict with Prettier.
  prettier,
);
