import { describe, expect, vi, it, beforeEach } from "vitest";
import { getLogger, setLogger } from "../logger";
import pino from "pino";

const defaultLogger = pino({
  name: "dandori",
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

vi.mock("pino", () => ({
  default: vi.fn(),
}));

describe("logger", () => {
  describe("use default logger", () => {
    it("get default logger", () => {
      expect(getLogger()).toEqual(defaultLogger);
    });
  });

  describe("use custom logger", () => {
    const customLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      customProp: vi.fn(),
    };

    beforeEach(() => {
      setLogger(customLogger);
    });

    it("get custom logger", () => {
      expect(getLogger()).toEqual(customLogger);
    });
  });
});
