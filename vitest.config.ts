import { defineConfig } from "vitest/config";

const sharedConfig = defineConfig({
  test: {
    environment: "node",
    typecheck: {
      checker: "tsc",
      include: ["./**/__tests__/**/.test.ts"],
    },
  },
});

export default sharedConfig;
