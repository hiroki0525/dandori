import { describe, beforeEach, afterEach, vi, Mock, it, expect } from "vitest";
import { logger, runPromisesSequentially } from "@dandori/libs";
import { Board } from "@mirohq/miro-api";
import { generateDandoriMiroCards } from "../index";
import { DandoriTask } from "@dandori/core";

vi.mock("@mirohq/miro-api", () => {
  const MiroApi = vi.fn();
  const Board = vi.fn();
  Board.prototype = {
    createAppCardItem: vi.fn((cardParams) => ({ id: cardParams.data.title })),
    createCardItem: vi.fn((cardParams) => ({ id: cardParams.data.title })),
    createConnector: vi.fn(),
  };
  MiroApi.prototype = {
    getBoard: vi.fn(() => new Board()),
  };
  return { MiroApi, Board };
});

vi.mock("@dandori/libs", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
  },
  runPromisesSequentially: vi.fn((runPromises, _runningLogPrefix) =>
    Promise.all(runPromises.map((runPromise: () => any) => runPromise())),
  ),
}));

const mockRunPromisesSequentially = runPromisesSequentially as Mock;
const mockLogInfo = logger.info as Mock;

describe("generateDandoriMiroCards", () => {
  let board: Board;

  const defaultCardMarginX = 130;
  const defaultCardMarginY = defaultCardMarginX / 2;
  const defaultCardWidth = defaultCardMarginX * 2;
  const defaultCardHeight = defaultCardMarginY * 2;
  // 1 ─ 2 ─ 4
  //   └ 3 ┘
  // 5 ─ 6 ─ 8
  //   └ 7 ┘
  const tasks: DandoriTask[] = [
    {
      id: "1",
      name: "task1",
      deadline: "2021-01-01",
      description: "task1-description",
      fromTaskIdList: [],
    },
    {
      id: "2",
      name: "task2",
      deadline: "2021-01-02",
      description: "task2-description",
      fromTaskIdList: ["1"],
    },
    {
      id: "3",
      name: "task3",
      deadline: "2021-01-03",
      description: "task3-description",
      fromTaskIdList: ["1"],
    },
    {
      id: "4",
      name: "task4",
      deadline: "2021-01-04",
      description: "task4-description",
      fromTaskIdList: ["2", "3"],
    },
    {
      id: "5",
      name: "task5",
      deadline: "2021-01-05",
      description: "task5-description",
      fromTaskIdList: [],
    },
    {
      id: "6",
      name: "task6",
      deadline: "2021-01-06",
      description: "task6-description",
      fromTaskIdList: ["5"],
    },
    {
      id: "7",
      name: "task7",
      deadline: "2021-01-07",
      description: "task7-description",
      fromTaskIdList: ["5"],
    },
    {
      id: "8",
      name: "task8",
      deadline: "2021-01-08",
      description: "task8-description",
      fromTaskIdList: ["6", "7"],
    },
  ];
  const taskMapXY: Record<string, { x: number; y: number }> = {
    "1": { x: 0, y: 0 },
    "2": { x: 1, y: 0 },
    "3": { x: 1, y: 1 },
    "4": { x: 2, y: 0 },
    "5": { x: 0, y: 2 },
    "6": { x: 1, y: 2 },
    "7": { x: 1, y: 3 },
    "8": { x: 2, y: 2 },
  };
  const cardParams = tasks.map((task) => {
    const xy = taskMapXY[task.id];
    return {
      data: {
        title: task.name,
        description: task.description,
        dueDate: task.deadline ? new Date(task.deadline) : undefined,
      },
      geometry: {
        width: defaultCardWidth,
        height: defaultCardHeight,
      },
      position: {
        x: (defaultCardMarginX + defaultCardWidth) * xy.x,
        y: (defaultCardMarginY + defaultCardHeight) * xy.y,
      },
    };
  });
  const connectorParams = [
    {
      startItem: {
        id: "task1",
      },
      endItem: {
        id: "task2",
      },
    },
    {
      startItem: {
        id: "task1",
      },
      endItem: {
        id: "task3",
      },
    },
    {
      startItem: {
        id: "task2",
      },
      endItem: {
        id: "task4",
      },
    },
    {
      startItem: {
        id: "task3",
      },
      endItem: {
        id: "task4",
      },
    },
    {
      startItem: {
        id: "task5",
      },
      endItem: {
        id: "task6",
      },
    },
    {
      startItem: {
        id: "task5",
      },
      endItem: {
        id: "task7",
      },
    },
    {
      startItem: {
        id: "task6",
      },
      endItem: {
        id: "task8",
      },
    },
    {
      startItem: {
        id: "task7",
      },
      endItem: {
        id: "task8",
      },
    },
  ];

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    board = new Board();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("card", () => {
    beforeEach(async () => {
      await generateDandoriMiroCards(tasks, {
        boardId: "boardId",
      });
    });

    it("createCardItem called", () => {
      expect((board.createCardItem as Mock).mock.calls.flat()).toEqual(
        expect.arrayContaining(cardParams),
      );
    });

    it("createConnector called", () => {
      expect((board.createConnector as Mock).mock.calls.flat()).toStrictEqual(
        expect.arrayContaining(connectorParams),
      );
    });

    it("runPromisesSequentially called with creating cards log", () => {
      expect(mockRunPromisesSequentially.mock.calls[0][1]).toBe(
        "Creating cards",
      );
    });

    it("runPromisesSequentially called with creating connectors log", () => {
      expect(mockRunPromisesSequentially.mock.calls[1][1]).toBe(
        "Creating connectors",
      );
    });

    it("called log info", () => {
      expect(mockLogInfo.mock.lastCall[0]).toBe(
        "Create miro cards and connectors successfully!",
      );
    });
  });
});
