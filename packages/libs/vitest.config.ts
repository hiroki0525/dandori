import { mergeConfig, defineConfig } from "vitest/config";
import sharedConfig from "../../vitest.config";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      // to test runPromisesSequentially
      dangerouslyIgnoreUnhandledErrors: true,
    },
  }),
);
