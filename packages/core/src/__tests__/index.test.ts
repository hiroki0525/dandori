import generateDandoriTasks, {
  ChatGPTFunctionCallModel,
  DandoriTaskOptionalProperty,
  DandoriTaskProperty,
  DandoriTaskRequiredProperty,
  OptionalAllDandoriTaskPropertiesName,
} from "../index";
import { describe, beforeEach, afterEach, it, vi, expect, Mock } from "vitest";
import OpenAI from "openai";
import { loadEnvFile, logger, runPromisesSequentially } from "@dandori/libs";

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
  const actualModule =
    await vi.importActual<typeof import("@dandori/libs")>("@dandori/libs");
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
    loadEnvFile: vi.fn(),
  };
});

const runPromisesSequentiallyMock = runPromisesSequentially as Mock;
const loadEnvFileMock = loadEnvFile as Mock;

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
    const envFilePath = `./dir/.env`;

    beforeEach(async () => {
      await generateDandoriTasks("test", {
        envFilePath,
      });
    });

    it("call loadEnvFile with envFilePath argument", () => {
      expect(loadEnvFileMock).toBeCalledWith(envFilePath);
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
    const requiredProperties: DandoriTaskRequiredProperty[] = [
      "id",
      "name",
      "fromTaskIdList",
    ];
    const logPrefix = "Generating tasks";
    const createOpenAiChatGptArguments = ({
      source,
      model = "gpt-3.5-turbo-0613",
      filter = requiredProperties,
    }: {
      source: string;
      model?: ChatGPTFunctionCallModel;
      filter?: DandoriTaskProperty[];
    }) => ({
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
                  properties: Object.fromEntries(
                    filter.map((prop) => [
                      prop,
                      functionCallTaskProperties[prop],
                    ]),
                  ),
                },
              },
            },
          },
        },
      ],
    });

    let result: Awaited<ReturnType<typeof generateDandoriTasks>>;

    beforeEach(() => {
      process.env[openApiKeyPropName] = apiKey;
    });

    it(`loaded ${openApiKeyPropName}`, () => {
      expect(process.env[openApiKeyPropName]).toBe(apiKey);
    });

    describe("with options which include model argument", () => {
      const source = "with model argument";
      const model = "gpt-4-0613";

      beforeEach(async () => {
        result = await generateDandoriTasks(source, {
          chatGPTModel: model,
        });
      });

      it("called chat.completions.create with valid arguments", () => {
        expect(openAI.chat.completions.create).toBeCalledWith(
          createOpenAiChatGptArguments({ source, model }),
        );
      });
    });

    describe("with options which include optionalProps argument", () => {
      describe("without all argument", () => {
        const source = "without all argument";
        const optionalTaskProps: DandoriTaskOptionalProperty[] = ["deadline"];

        beforeEach(async () => {
          result = await generateDandoriTasks(source, {
            optionalTaskProps,
          });
        });

        it("called chat.completions.create with valid arguments", () => {
          expect(openAI.chat.completions.create).toBeCalledWith(
            createOpenAiChatGptArguments({
              source,
              filter: [...optionalTaskProps, ...requiredProperties],
            }),
          );
        });
      });

      describe("with all argument", () => {
        const source = "with all argument";
        const optionalTaskProps: OptionalAllDandoriTaskPropertiesName[] = [
          "all",
        ];

        beforeEach(async () => {
          result = await generateDandoriTasks(source, {
            optionalTaskProps,
          });
        });

        it("called chat.completions.create with valid arguments", () => {
          expect(openAI.chat.completions.create).toBeCalledWith(
            createOpenAiChatGptArguments({
              source,
              filter: Object.keys(
                functionCallTaskProperties,
              ) as DandoriTaskProperty[],
            }),
          );
        });
      });
    });

    describe("without options", () => {
      const source = "without model argument";

      beforeEach(async () => {
        result = await generateDandoriTasks(source);
      });

      it("called chat.completions.create with valid arguments", () => {
        expect(openAI.chat.completions.create).toBeCalledWith(
          createOpenAiChatGptArguments({ source }),
        );
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
