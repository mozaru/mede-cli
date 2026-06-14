import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      MEDE_LLM_RETRIES: "2",
    },
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
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
      ],
      reporter: ["text-summary", "html"],
      // Floor calibrated to the current suite; ratchet up as coverage grows.
      // Lowering any of these requires an explicit, justified change.
      thresholds: {
        statements: Number(process.env.MEDE_COVERAGE_STATEMENTS) || 88,
        branches: Number(process.env.MEDE_COVERAGE_BRANCHES) || 80,
        functions: Number(process.env.MEDE_COVERAGE_FUNCTIONS) || 88,
        lines: Number(process.env.MEDE_COVERAGE_LINES) || 89,
      },
    },
  },
});
