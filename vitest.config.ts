import { defineWorkspace } from "vitest/config";

const sharedConfig = defineWorkspace([
  "packages/*",
  {
    test: {
      environment: "node",
      typecheck: {
        checker: "tsc",
        include: ["./**/__tests__/**/.test.ts"],
      },
    },
  },
]);

export default sharedConfig;
