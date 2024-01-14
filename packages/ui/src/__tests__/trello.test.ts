import { describe, beforeEach, afterEach, vi, expect, it, Mock } from "vitest";
import { DandoriTask } from "@dandori/core";
import { generateDandoriTrelloCards } from "../index";
import { runPromisesSequentially } from "@dandori/libs";
import { TrelloClient } from "../trello/client";

vi.mock("../trello/client", () => {
  const TrelloClient = vi.fn();
  TrelloClient.prototype = {
    getLists: vi.fn(() => [
      {
        id: "1",
        name: "TODO",
      },
      {
        id: "2",
        name: "DOING",
      },
      {
        id: "3",
        name: "done",
      },
    ]),
    createCard: vi.fn(),
  };
  return { TrelloClient };
});

vi.mock("@dandori/libs", () => {
  return {
    runPromisesSequentially: vi.fn((runPromises, _runningLogPrefix) =>
      Promise.all(runPromises.map((runPromise: () => any) => runPromise())),
    ),
    checkApiKey: vi.fn(),
  };
});

const mockRunPromisesSequentially = runPromisesSequentially as Mock;

describe("generateDandoriTrelloCards", () => {
  let client: TrelloClient;

  const todoWithStatus = "TODO";
  const noStatus = "DOING";
  const doneWithStatusButInvalidTrelloListName = "DONE";

  const tasks: DandoriTask[] = [
    {
      id: "1",
      name: todoWithStatus,
      status: "todo",
      fromTaskIdList: [],
    },
    {
      id: "2",
      name: noStatus,
      fromTaskIdList: ["1"],
    },
    {
      id: "3",
      name: doneWithStatusButInvalidTrelloListName,
      status: "done",
      fromTaskIdList: ["2"],
    },
  ];
  const boardId = "boardId";

  const findPagePropertiesMockParam = (taskName: string) => {
    const params = (client.createCard as Mock).mock.calls.flat();
    return params.find(({ name }) => name === taskName);
  };

  beforeEach(() => {
    client = new TrelloClient("key", "token");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("with status.todo mapping", () => {
    beforeEach(async () => {
      await generateDandoriTrelloCards(tasks, {
        boardId,
        trelloListPropertiesMap: {
          "status.todo": todoWithStatus,
        },
      });
    });

    it("runPromisesSequentially called with creating pages log", () => {
      expect(mockRunPromisesSequentially.mock.calls[0][1]).toBe(
        "Creating Trello Cards",
      );
    });

    it("called valid arguments", () => {
      expect(findPagePropertiesMockParam(todoWithStatus)).toMatchObject({
        name: todoWithStatus,
        listId: "1",
      });
    });
  });

  describe("with status.doing mapping", () => {
    beforeEach(async () => {
      await generateDandoriTrelloCards(tasks, {
        boardId,
        trelloListPropertiesMap: {
          "status.doing": noStatus,
        },
      });
    });

    it("no called valid arguments", () => {
      expect(findPagePropertiesMockParam(noStatus)).toBeUndefined();
    });
  });

  describe("with status.done mapping", () => {
    beforeEach(async () => {
      await generateDandoriTrelloCards(tasks, {
        boardId,
        trelloListPropertiesMap: {
          "status.done": doneWithStatusButInvalidTrelloListName,
        },
      });
    });

    it("no called valid arguments", () => {
      expect(
        findPagePropertiesMockParam(doneWithStatusButInvalidTrelloListName),
      ).toBeUndefined();
    });
  });
});
