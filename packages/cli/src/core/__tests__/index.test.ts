import { rm, writeFile } from "fs/promises";
import {
  describe,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
  vi,
  expect,
  it,
} from "vitest";
import DandoriCoreCli from "../index";
import generateDandoriTasks, { DandoriTask } from "@dandori/core";

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

describe("DandoriCoreCli", () => {
  const mockConsole = vi.spyOn(console, "log");
  const inputFileName = "DandoriCoreCli.txt";
  const inputFileText = "DandoriCoreCli";
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

  describe("without options", () => {
    beforeEach(async () => {
      loadProcessArgv([]);
      await new DandoriCoreCli().run();
    });

    it("call generateDandoriTasks", () => {
      expect(generateDandoriTasks).toHaveBeenCalledWith(inputFileText, {
        envFilePath: undefined,
      });
    });

    it("call console.log", () => {
      expect(mockConsole).toHaveBeenCalledWith(JSON.stringify(tasks, null, 2));
    });
  });

  describe("with -e option", () => {
    const envFilePath = "/test/.env";

    beforeEach(async () => {
      loadProcessArgv(["-e", envFilePath]);
      await new DandoriCoreCli().run();
    });

    it("call generateDandoriTasks with envFilePath", () => {
      expect(generateDandoriTasks).toHaveBeenCalledWith(inputFileText, {
        envFilePath,
      });
    });
  });
});
