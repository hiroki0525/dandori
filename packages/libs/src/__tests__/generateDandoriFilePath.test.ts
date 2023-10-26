import { generateDandoriFilePath } from "../index";
import { describe, it, expect } from "vitest";

describe("generateDandoriFilePath", () => {
  describe("without arguments", () => {
    it("returns cwd", () => {
      expect(generateDandoriFilePath()).toBe(process.cwd());
    });
  });

  describe("with arguments", () => {
    describe("argument is absolute path", () => {
      const absoluteFilePath = "/path/to/file";

      it("returns arguments path", () => {
        expect(generateDandoriFilePath(absoluteFilePath)).toBe(
          absoluteFilePath,
        );
      });
    });

    describe("argument is relative path", () => {
      const basePath = "/path/to/file";
      const relativeFilePath = `.${basePath}`;

      it("returns arguments path", () => {
        expect(generateDandoriFilePath(relativeFilePath)).toBe(
          `${process.cwd()}${basePath}`,
        );
      });
    });
  });
});
