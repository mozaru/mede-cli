import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      MEDE_LLM_RETRIES: "2",
    },
    include: ["src/**/*.integration.test.ts"],
  },
});
