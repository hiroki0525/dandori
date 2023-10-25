import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    typecheck: {
      checker: "tsc",
      include: ["./**/__tests__/**/.test.ts"],
    },
  },
});
