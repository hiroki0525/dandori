import { describe, expect, vi, it, beforeEach } from "vitest";
import { getLogger, getLogLevel, setLogger } from "../logger";
import { createLogger, format, transports } from "winston";

vi.mock("winston", () => ({
  createLogger: vi.fn(),
  format: {
    combine: vi.fn(),
    colorize: vi.fn(),
    timestamp: vi.fn(),
    splat: vi.fn(),
    json: vi.fn(),
    printf: vi.fn(),
  },
  transports: {
    Console: vi.fn(),
  },
}));

const defaultLogger = createLogger({
  level: getLogLevel(),
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.splat(),
    format.json(),
    format.printf((info) => {
      return `[${info.timestamp}] ${info.level} : ${info.message}`;
    }),
  ),
  transports: [new transports.Console()],
});

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
