import { loadFile } from "../index";
import { describe, it, expect } from "vitest";

describe("loadFile", () => {
  describe("without arguments", () => {
    it("returns cwd", () => {
      expect(loadFile()).toBe(process.cwd());
    });
  });

  describe("with arguments", () => {
    describe("argument is absolute path", () => {
      const absoluteFilePath = "/path/to/file";

      it("returns arguments path", () => {
        expect(loadFile(absoluteFilePath)).toBe(absoluteFilePath);
      });
    });

    describe("argument is relative path", () => {
      const basePath = "/path/to/file";
      const relativeFilePath = `.${basePath}`;

      it("returns arguments path with cwd", () => {
        expect(loadFile(relativeFilePath)).toBe(`${process.cwd()}${basePath}`);
      });
    });
  });
});
