import {
  describe,
  beforeEach,
  afterEach,
  vi,
  expect,
  it,
  beforeAll,
  afterAll,
  Mock,
} from "vitest";
import { DandoriTask } from "@dandori/core";
import { generateDandoriNotionPages } from "@dandori/ui";
import DandoriMiroCli from "../index";
import { rm, writeFile } from "fs/promises";

const tasks: DandoriTask[] = [
  {
    id: "1",
    name: "task1",
    deadline: "2021-01-01",
    description: "task1-description",
    fromTaskIdList: [],
    status: "todo",
  },
];

vi.mock("@dandori/core", () => ({
  default: vi.fn(() => tasks),
}));

vi.mock("@dandori/ui", () => ({
  generateDandoriNotionPages: vi.fn(),
}));

const mockGenerateDandoriNotionPages = generateDandoriNotionPages as Mock;

describe("DandoriNotionCli", () => {
  const inputFileName = "DandoriNotionCli.txt";
  const inputFileText = "DandoriNotionCli";
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

  describe("with -d option", () => {
    const databaseId = "databaseId";

    beforeEach(async () => {
      loadProcessArgv(["-d", databaseId]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with database id", () => {
      expect(mockGenerateDandoriNotionPages.mock.lastCall[1]).toContain({
        databaseId,
      });
    });
  });

  describe("with --name option", () => {
    const name = "Name";

    beforeEach(async () => {
      loadProcessArgv(["--name", name]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.name", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        name,
      });
    });
  });

  describe("with --deadline option", () => {
    const deadline = "Deadline";

    beforeEach(async () => {
      loadProcessArgv(["--deadline", deadline]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.deadline", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        deadline,
      });
    });
  });

  describe("with --status option", () => {
    const status = "Status";

    beforeEach(async () => {
      loadProcessArgv(["--status", status]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.status", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        status,
      });
    });
  });

  describe("with --status-todo option", () => {
    const statusTodo = "ToDo";

    beforeEach(async () => {
      loadProcessArgv(["--status-todo", statusTodo]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.status.todo", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        "status.todo": statusTodo,
      });
    });
  });

  describe("with --status-doing option", () => {
    const statusDoing = "Doing";

    beforeEach(async () => {
      loadProcessArgv(["--status-doing", statusDoing]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.status.doing", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        "status.doing": statusDoing,
      });
    });
  });

  describe("with --status-done option", () => {
    const statusDone = "Done";

    beforeEach(async () => {
      loadProcessArgv(["--status-done", statusDone]);
      await new DandoriMiroCli().run();
    });

    it("call generateDandoriNotionPages with databasePropertiesMap.status.done", () => {
      expect(
        mockGenerateDandoriNotionPages.mock.lastCall[1].databasePropertiesMap,
      ).toContain({
        "status.done": statusDone,
      });
    });
  });
});
