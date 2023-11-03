import {
  describe,
  beforeEach,
  afterEach,
  vi,
  expect,
  it,
  beforeAll,
  afterAll,
} from "vitest";
import { DandoriTask } from "@dandori/core";
import { generateDandoriMiroCards } from "@dandori/ui";
import DandoriMiroCli from "../index";
import { rm, writeFile } from "fs/promises";

const tasks: DandoriTask[] = [
  {
    id: "1",
    name: "task1",
    deadline: "2021-01-01",
    description: "task1-description",
    fromTaskIdList: [],
  },
];

vi.mock("@dandori/core", () => ({
  default: vi.fn(() => tasks),
}));

vi.mock("@dandori/ui", () => ({
  generateDandoriMiroCards: vi.fn(),
}));

describe("DandoriCoreCli", () => {
  const inputFileName = "input.txt";
  const inputFileText = "test";
  const boardId = "boardId";
  const loadProcessArgv = (options: string[]) => {
    process.argv = ["node", "cli.js", inputFileName, ...options];
  };

  beforeAll(async () => {
    await writeFile(inputFileName, inputFileText);
  });

  afterAll(async () => {
    await rm(inputFileName);
  });

  afterEach(() => {
    process.argv = [];
    vi.clearAllMocks();
  });

  describe("with -a option", () => {
    beforeEach(async () => {
      loadProcessArgv(["-a"]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriTasks with envFilePath", () => {
      expect(generateDandoriMiroCards).toHaveBeenCalledWith(tasks, {
        boardId: undefined,
        isAppCard: true,
      });
    });
  });

  describe("with -b option", () => {
    beforeEach(async () => {
      loadProcessArgv(["-b", boardId]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriTasks with envFilePath", () => {
      expect(generateDandoriMiroCards).toHaveBeenCalledWith(tasks, {
        boardId,
        isAppCard: undefined,
      });
    });
  });
});
