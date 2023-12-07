import { describe, it, expect } from "vitest";
import { checkApiKey } from "../index";

describe("checkApiKey", () => {
  const keyName = "keyName";
  const targetKey = "targetKey";
  const alternativeKey = "alternativeKey";

  describe("with targetKey", () => {
    describe("with alternativeKey", () => {
      it("returns targetKey", () => {
        expect(checkApiKey(keyName, targetKey, alternativeKey)).toBe(targetKey);
      });
    });

    describe("without alternativeKey", () => {
      it("returns targetKey", () => {
        expect(checkApiKey(keyName, targetKey, undefined)).toBe(targetKey);
      });
    });
  });

  describe("without targetKey", () => {
    describe("with alternativeKey", () => {
      it("returns alternativeKey", () => {
        expect(checkApiKey(keyName, undefined, alternativeKey)).toBe(
          alternativeKey,
        );
      });
    });

    describe("without alternativeKey", () => {
      it("throw error", () => {
        expect(() => checkApiKey(keyName, undefined, undefined)).toThrow(
          `Please set ${keyName}.`,
        );
      });
    });
  });
});
