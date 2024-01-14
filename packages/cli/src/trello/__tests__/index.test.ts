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
import { generateDandoriTrelloCards } from "@dandori/ui";
import DandoriTrelloCli from "../index";
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
  generateDandoriTrelloCards: vi.fn(),
}));

const mockGenerateDandoriTrelloCards = generateDandoriTrelloCards as Mock;

describe("DandoriTrelloCli", () => {
  const inputFileName = "DandoriTrelloCli.txt";
  const inputFileText = "DandoriTrelloCli";
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

  describe("with -b option", () => {
    const boardId = "boardId";

    beforeEach(async () => {
      loadProcessArgv(["-b", boardId]);
      await new DandoriTrelloCli().run();
    });

    it("call generateDandoriTrelloCards with board id", () => {
      expect(mockGenerateDandoriTrelloCards.mock.lastCall[1]).toMatchObject({
        boardId,
      });
    });
  });

  describe("with --status-todo option", () => {
    const statusTodo = "ToDo";

    beforeEach(async () => {
      loadProcessArgv(["--status-todo", statusTodo]);
      await new DandoriTrelloCli().run();
    });

    it("call generateDandoriTrelloCards with trelloListPropertiesMap.status.todo", () => {
      expect(
        mockGenerateDandoriTrelloCards.mock.lastCall[1].trelloListPropertiesMap,
      ).toMatchObject({
        "status.todo": statusTodo,
      });
    });
  });

  describe("with --status-doing option", () => {
    const statusDoing = "Doing";

    beforeEach(async () => {
      loadProcessArgv(["--status-doing", statusDoing]);
      await new DandoriTrelloCli().run();
    });

    it("call generateDandoriTrelloCards with trelloListPropertiesMap.status.doing", () => {
      expect(
        mockGenerateDandoriTrelloCards.mock.lastCall[1].trelloListPropertiesMap,
      ).toMatchObject({
        "status.doing": statusDoing,
      });
    });
  });

  describe("with --status-done option", () => {
    const statusDone = "Done";

    beforeEach(async () => {
      loadProcessArgv(["--status-done", statusDone]);
      await new DandoriTrelloCli().run();
    });

    it("call generateDandoriTrelloCards with trelloListPropertiesMap.status.done", () => {
      expect(
        mockGenerateDandoriTrelloCards.mock.lastCall[1].trelloListPropertiesMap,
      ).toMatchObject({
        "status.done": statusDone,
      });
    });
  });
});
