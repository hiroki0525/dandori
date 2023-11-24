import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  format: ["esm"],
  entry: ["src", "!src/**/*.test.*", "!src/**__test__/**"],
  platform: "node",
  banner: {
    // Error: "Dynamic require of "os" is not supported"
    // Solution: https://github.com/evanw/esbuild/issues/1921#issuecomment-1623640043
    js: `
const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
    `,
  },
});
