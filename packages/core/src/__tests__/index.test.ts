import { mkdir, rm, rmdir, writeFile } from "fs/promises";
import generateDandoriTasks, { DandoriTask } from "../index";
import {
  describe,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
  it,
  vi,
  expect,
  Mock,
} from "vitest";
import OpenAI from "openai";
import { logger, runPromisesSequentially } from "@dandori/libs";

const openAiResArguments = { tasks: [] } as const;
vi.mock("openai", () => {
  const OpenAI = vi.fn();
  OpenAI.prototype.chat = {
    completions: {
      create: vi.fn(() => ({
        choices: [
          {
            message: {
              function_call: {
                arguments: JSON.stringify(openAiResArguments),
              },
            },
          },
        ],
      })),
    },
  };
  return { default: OpenAI };
});

vi.mock("@dandori/libs", async () => {
  const actualModule = await import("@dandori/libs");
  return {
    ...actualModule,
    logger: {
      error: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
    },
    runPromisesSequentially: vi.fn((runPromises, _runningLogPrefix) =>
      Promise.all(runPromises.map((runPromise: () => any) => runPromise())),
    ),
  };
});

const runPromisesSequentiallyMock = runPromisesSequentially as Mock;

describe("generateDandoriTasks", () => {
  const openApiKeyPropName = "OPENAI_API_KEY";
  let openAI: OpenAI;

  beforeEach(() => {
    openAI = new OpenAI();
  });

  afterEach(() => {
    delete process.env[openApiKeyPropName];
    vi.clearAllMocks();
  });

  describe(`without ${openApiKeyPropName} environment variable`, () => {
    describe("with valid .env file", () => {
      describe("no envFilePath argument", () => {
        const apiKey = "123";
        const envFileName = ".env";

        beforeAll(async () => {
          await writeFile(envFileName, `${openApiKeyPropName}=${apiKey}`);
        });

        afterAll(async () => {
          await rm(envFileName);
        });

        beforeEach(async () => {
          await generateDandoriTasks("test");
        });

        it(`loaded ${openApiKeyPropName}`, () => {
          expect(process.env[openApiKeyPropName]).toBe(apiKey);
        });
      });

      describe("envFilePath argument", () => {
        const apiKey = "456";
        const envFileDir = "./dir";
        const envFilePath = `./${envFileDir}/.env`;

        beforeAll(async () => {
          await mkdir(envFileDir);
          await writeFile(envFilePath, `${openApiKeyPropName}=${apiKey}`);
        });

        afterAll(async () => {
          await rm(envFilePath);
          await rmdir(envFileDir);
        });

        beforeEach(async () => {
          await generateDandoriTasks("test", {
            envFilePath,
          });
        });

        it(`loaded ${openApiKeyPropName}`, () => {
          expect(process.env[openApiKeyPropName]).toBe(apiKey);
        });
      });
    });

    describe("without valid .env file", () => {
      let resultPromise: Promise<unknown>;

      beforeEach(() => {
        resultPromise = generateDandoriTasks("test", {
          envFilePath: "./nodir/.env",
        });
      });

      it("throw Error", async () => {
        await expect(resultPromise).rejects.toThrowError();
      });

      it("called error log", async () => {
        try {
          await resultPromise;
        } catch (e) {
          expect(logger.error).toBeCalled();
        }
      });
    });
  });

  describe(`with ${openApiKeyPropName} environment variable`, () => {
    const apiKey = "789";
    const functionCallName = "get_tasks_flow";
    const excludePropertyPrompt =
      "If not provided, this property shouldn't be included.";
    const generateIdPrompt = "If not provided, return generated unique ID.";
    const functionCallTaskProperties = {
      id: {
        type: "string",
        description: `The task ID. ${generateIdPrompt}`,
      },
      name: {
        type: "string",
        description: "The task name",
      },
      description: {
        type: "string",
        description: "The task description",
      },
      deadline: {
        type: "string",
        description: `The task deadline which is used by JavaScript Date constructor arguments. ${excludePropertyPrompt}`,
      },
      assignee: {
        type: "object",
        description: `The task assignee. ${excludePropertyPrompt}`,
        properties: {
          id: {
            type: "string",
            description: `The task assignee ID. ${generateIdPrompt}`,
          },
          name: {
            type: "string",
            description: "The task assignee name.",
          },
        },
      },
      fromTaskIdList: {
        type: "array",
        description: "Task IDs to be executed before this task",
        items: {
          type: "string",
        },
      },
    } as const;
    const requiredProperties: readonly (keyof DandoriTask)[] = [
      "id",
      "name",
      "fromTaskIdList",
    ];
    const logPrefix = "Generating tasks";

    beforeEach(() => {
      process.env[openApiKeyPropName] = apiKey;
    });

    it(`loaded ${openApiKeyPropName}`, () => {
      expect(process.env[openApiKeyPropName]).toBe(apiKey);
    });

    describe("with model argument", () => {
      let result: Awaited<ReturnType<typeof generateDandoriTasks>>;
      const source = "with model argument";
      const model = "gpt-4-0613";

      beforeEach(async () => {
        result = await generateDandoriTasks(source, {
          chatGPTModel: model,
        });
      });

      it("called chat.completions.create with valid arguments", () => {
        expect(openAI.chat.completions.create).toBeCalledWith({
          messages: [{ role: "user", content: source }],
          model,
          function_call: { name: functionCallName },
          functions: [
            {
              name: functionCallName,
              description:
                "Get the tasks flow which will be used like Gantt chart.",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      required: requiredProperties,
                      properties: functionCallTaskProperties,
                    },
                  },
                },
              },
            },
          ],
        });
      });

      it("called logger.debug with valid arguments", () => {
        expect(logger.debug).toBeCalledWith(openAiResArguments.tasks);
      });

      it("return tasks", () => {
        expect(result).toStrictEqual(openAiResArguments.tasks);
      });

      it("called log with valid statement", () => {
        expect(runPromisesSequentiallyMock.mock.calls[0][1]).toContain(
          logPrefix,
        );
      });
    });

    describe("without model argument", () => {
      let result: Awaited<ReturnType<typeof generateDandoriTasks>>;
      const source = "without model argument";

      beforeEach(async () => {
        result = await generateDandoriTasks(source);
      });

      it("called chat.completions.create with valid arguments", () => {
        expect(openAI.chat.completions.create).toBeCalledWith({
          messages: [{ role: "user", content: source }],
          model: "gpt-3.5-turbo-0613",
          function_call: { name: functionCallName },
          functions: [
            {
              name: functionCallName,
              description:
                "Get the tasks flow which will be used like Gantt chart.",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      required: requiredProperties,
                      properties: functionCallTaskProperties,
                    },
                  },
                },
              },
            },
          ],
        });
      });

      it("called logger.debug with valid arguments", () => {
        expect(logger.debug).toBeCalledWith(openAiResArguments.tasks);
      });

      it("return tasks", () => {
        expect(result).toStrictEqual(openAiResArguments.tasks);
      });

      it("called log with valid statement", () => {
        expect(runPromisesSequentiallyMock.mock.calls[0][1]).toContain(
          logPrefix,
        );
      });
    });
  });
});
