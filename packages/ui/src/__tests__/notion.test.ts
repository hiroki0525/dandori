import {
  describe,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  expect,
  it,
  Mock,
} from "vitest";
import { DandoriTask } from "@dandori/core";
import { Client } from "@notionhq/client";
import { DatabasePropertiesMap, generateDandoriNotionPages } from "../index";
import { runPromisesSequentially } from "@dandori/libs";

vi.mock("@notionhq/client", () => {
  const Client = vi.fn();
  enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
  }
  Client.prototype = {
    pages: {
      create: vi.fn(),
    },
  };
  return { Client, LogLevel };
});

vi.mock("@dandori/libs", () => {
  return {
    getLogLevel: () => "info",
    getLogger: vi.fn(() => ({
      info: vi.fn(),
    })),
    runPromisesSequentially: vi.fn((runPromises, _runningLogPrefix) =>
      Promise.all(runPromises.map((runPromise: () => any) => runPromise())),
    ),
    checkApiKey: vi.fn(),
  };
});

const mockRunPromisesSequentially = runPromisesSequentially as Mock;

describe("generateDandoriNotionPages", () => {
  let client: Client;

  const withAllPropsTaskName = "with all props";
  const withoutDeadlineTaskName = "without deadline";
  const deadlineIsPastTaskName = "deadline is past";
  const withoutStatusTaskName = "without status";

  const tasks: DandoriTask[] = [
    {
      id: "1",
      name: withAllPropsTaskName,
      deadline: "9999-01-01",
      description: "task1-description",
      status: "todo",
      fromTaskIdList: [],
    },
    {
      id: "3",
      name: withoutDeadlineTaskName,
      description: "task3-description",
      status: "done",
      fromTaskIdList: ["1"],
    },
    {
      id: "4",
      name: deadlineIsPastTaskName,
      deadline: "2000-01-01",
      description: "task4-description",
      status: "done",
      fromTaskIdList: ["1"],
    },
    {
      id: "5",
      name: withoutStatusTaskName,
      deadline: "9999-01-04",
      description: "task4-description",
      fromTaskIdList: ["2", "3"],
    },
  ];
  const databaseId = "databaseId";

  const findTask = (taskName: string) => {
    return tasks.find(({ name }) => name === taskName) as DandoriTask;
  };

  const findPagePropertiesMockParam = (
    taskName: string,
    nameProp: string = "title",
  ) => {
    const params = (client.pages.create as Mock).mock.calls.flat();
    return params.find(
      ({ properties }) =>
        properties[nameProp].title[0].text.content === taskName,
    );
  };

  beforeAll(() => {
    process.env.NOTION_API_KEY = "token";
  });

  beforeEach(() => {
    client = new Client();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("one task with all props", () => {
    describe("without mapping", () => {
      beforeEach(async () => {
        await generateDandoriNotionPages(tasks, {
          databaseId,
        });
      });

      it("runPromisesSequentially called with creating pages log", () => {
        expect(mockRunPromisesSequentially.mock.calls[0][1]).toBe(
          "Creating Notion Pages",
        );
      });

      it("called valid parent arguments", () => {
        expect(findPagePropertiesMockParam(withAllPropsTaskName)).toMatchObject(
          {
            parent: {
              database_id: databaseId,
            },
          },
        );
      });

      it("called valid properties arguments", () => {
        expect(
          findPagePropertiesMockParam(withAllPropsTaskName).properties,
        ).toMatchObject({
          title: {
            title: [
              {
                text: {
                  content: withAllPropsTaskName,
                },
              },
            ],
          },
        });
      });
    });

    describe("with name mapping", () => {
      const nameProp = "TaskName";

      const databasePropertiesMap: DatabasePropertiesMap = {
        name: nameProp,
      };

      beforeEach(async () => {
        await generateDandoriNotionPages(tasks, {
          databaseId,
          databasePropertiesMap,
        });
      });

      it("called valid properties arguments", () => {
        expect(
          findPagePropertiesMockParam(withAllPropsTaskName, nameProp)
            .properties,
        ).toMatchObject({
          [nameProp]: {
            title: [
              {
                text: {
                  content: withAllPropsTaskName,
                },
              },
            ],
          },
        });
      });
    });

    describe("with description mapping", () => {
      const descriptionProp = "TaskDescription";

      const databasePropertiesMap: DatabasePropertiesMap = {
        description: descriptionProp,
      };

      beforeEach(async () => {
        await generateDandoriNotionPages(tasks, {
          databaseId,
          databasePropertiesMap,
        });
      });

      it("called valid properties arguments", () => {
        expect(
          findPagePropertiesMockParam(withAllPropsTaskName).properties,
        ).toMatchObject({
          [descriptionProp]: {
            rich_text: [
              {
                text: {
                  content: findTask(withAllPropsTaskName).description,
                },
              },
            ],
          },
        });
      });
    });

    describe("with deadline mapping", () => {
      const today = new Date(" 2050/08/30");
      const deadlineProp = "TaskDeadline";

      const databasePropertiesMap: DatabasePropertiesMap = {
        deadline: deadlineProp,
      };

      beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(today);
        await generateDandoriNotionPages(tasks, {
          databaseId,
          databasePropertiesMap,
        });
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      describe("without deadline", () => {
        it("not called arguments", () => {
          expect(
            findPagePropertiesMockParam(withoutDeadlineTaskName).properties,
          ).not.toMatchObject({
            [deadlineProp]: {
              date: {
                start: expect.anything(),
                end: expect.anything(),
              },
            },
          });
        });
      });

      describe("with deadline", () => {
        describe("deadline is past", () => {
          it("not called arguments", () => {
            expect(
              findPagePropertiesMockParam(deadlineIsPastTaskName).properties,
            ).not.toMatchObject({
              [deadlineProp]: {
                date: {
                  start: expect.anything(),
                  end: expect.anything(),
                },
              },
            });
          });
        });

        describe("deadline is future", () => {
          it("called arguments", () => {
            expect(
              findPagePropertiesMockParam(withAllPropsTaskName).properties,
            ).toMatchObject({
              [deadlineProp]: {
                date: {
                  start: today.toISOString(),
                  end: findTask(withAllPropsTaskName).deadline,
                },
              },
            });
          });
        });
      });
    });

    describe("with status mapping", () => {
      const statusProp = "TaskStatus";
      const statusTodoProp = "TaskToDo";

      const databasePropertiesMap: DatabasePropertiesMap = {
        status: statusProp,
        "status.todo": statusTodoProp,
      };

      beforeEach(async () => {
        await generateDandoriNotionPages(tasks, {
          databaseId,
          databasePropertiesMap,
        });
      });

      it("called valid properties arguments", () => {
        expect(
          findPagePropertiesMockParam(withAllPropsTaskName).properties,
        ).toMatchObject({
          [statusProp]: {
            select: {
              name: statusTodoProp,
            },
          },
        });
      });
    });
  });
});
