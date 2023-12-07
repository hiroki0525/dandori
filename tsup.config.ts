import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  shims: true,
  legacyOutput: true,
  splitting: false,
  format: ["esm", "cjs"],
  entry: ["src", "!src/**/*.test.*", "!src/**__test__/**"],
  platform: "node",
});
