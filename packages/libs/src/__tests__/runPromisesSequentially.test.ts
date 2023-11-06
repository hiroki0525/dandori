import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { runPromisesSequentially } from "../runPromisesSequentially";

const logErrorMock = vi.fn();
const logInfoMock = vi.fn();

vi.mock("../logger", () => ({
  getLogger: vi.fn(() => ({
    error: logErrorMock,
    info: logInfoMock,
  })),
}));

describe("runPromisesSequentially", () => {
  const msPerLog = 5000;
  const createRunPromise =
    (result: number, ms: number, isSuccess = true): (() => Promise<number>) =>
    () =>
      new Promise((resolve, reject) =>
        setTimeout(() => (isSuccess ? resolve : reject)(result), ms),
      );
  const runPromise1 = vi.fn(createRunPromise(1, msPerLog + 1000));
  const runPromise2 = vi.fn(createRunPromise(2, msPerLog));
  const runErrorPromise = vi.fn(createRunPromise(3, msPerLog - 1, false));
  const runningLogPrefix = "running";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("success", () => {
    let result: Promise<number[]>;

    beforeEach(() => {
      result = runPromisesSequentially(
        [runPromise1, runPromise2],
        runningLogPrefix,
      );
    });

    describe("initialized", () => {
      it("logger.info not called", () => {
        expect(logInfoMock).not.toBeCalled();
      });

      it("runPromise1 called", () => {
        expect(runPromise1).toBeCalled();
      });

      it("runPromise2 not called", () => {
        expect(runPromise2).not.toBeCalled();
      });
    });

    describe(`${msPerLog} ms later`, () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(msPerLog);
      });

      it("logger.info called", () => {
        expect(logInfoMock.mock.lastCall[0]).toBe(
          `${runningLogPrefix}... (1/2)`,
        );
      });

      it("runPromise1 called", () => {
        expect(runPromise1).toBeCalled();
      });

      it("runPromise2 not called", () => {
        expect(runPromise2).not.toBeCalled();
      });
    });

    describe(`${msPerLog * 2} ms later`, () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(msPerLog * 2);
      });

      it("logger.info called", () => {
        expect(logInfoMock.mock.lastCall[0]).toBe(
          `${runningLogPrefix}... (2/2)`,
        );
      });

      it("runPromise1 called", () => {
        expect(runPromise1).toBeCalled();
      });

      it("runPromise2 called", () => {
        expect(runPromise2).toBeCalled();
      });
    });

    describe(`${msPerLog * 3} ms later`, () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(msPerLog * 3);
      });

      it("logger.info called", () => {
        expect(logInfoMock.mock.lastCall[0]).toBe(
          `${runningLogPrefix}... Done!`,
        );
      });

      it("runPromise1 called", () => {
        expect(runPromise1).toBeCalled();
      });

      it("runPromise2 called", () => {
        expect(runPromise2).toBeCalled();
      });

      it("can get results", async () => {
        await expect(result).resolves.toStrictEqual([1, 2]);
      });
    });
  });

  describe("failed", () => {
    let result: Promise<number[]>;

    beforeEach(() => {
      result = runPromisesSequentially(
        [runErrorPromise, runPromise1],
        runningLogPrefix,
      );
    });

    describe("initialized", () => {
      it("logger.info not called", () => {
        expect(logInfoMock).not.toBeCalled();
      });

      it("runErrorPromise called", () => {
        expect(runErrorPromise).toBeCalled();
      });

      it("runPromise1 not called", () => {
        expect(runPromise1).not.toBeCalled();
      });
    });

    describe(`${msPerLog - 1} ms later`, () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(msPerLog - 1);
      });

      it("logger.info not called", () => {
        expect(logInfoMock).not.toBeCalled();
      });

      it("logger.error called", () => {
        expect(logErrorMock.mock.lastCall[0]).toBe(3);
      });

      it("runPromise1 not called", () => {
        expect(runPromise1).not.toBeCalled();
      });

      it("get error result", async () => {
        await expect(result).rejects.toThrow();
      });
    });

    describe(`${msPerLog} ms later`, () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(msPerLog);
      });

      it("logger.info not called", () => {
        expect(logInfoMock).not.toBeCalled();
      });

      it("runPromise1 not called", () => {
        expect(runPromise1).not.toBeCalled();
      });
    });
  });
});
