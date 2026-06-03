import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Instrument every source file, not only the ones a test happens to load,
      // so coverage reflects the real product surface and new dead code is visible.
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/cli/index.ts", // process entry point
        "src/entities/**", // plain data holders
        "src/models/**", // plain data holders
        "src/**/interfaces/**", // type-only contracts
        "src/**/*-interface.ts", // type-only contracts
        "src/**/*.interface.ts", // type-only contracts
        // Methodology prompts are content, not logic. Tracked for externalization
        // (see the prompt-assets work); excluded from the coverage gate meanwhile.
        "src/shared/llm/llm-prompts-provider.ts",
      ],
      reporter: ["text-summary", "html"],
      // Floor calibrated to the current suite; ratchet up as coverage grows.
      // Lowering any of these requires an explicit, justified change.
      thresholds: {
        statements: 38,
        branches: 24,
        functions: 48,
        lines: 38,
      },
    },
  },
});
