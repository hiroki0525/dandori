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
import generateDandoriTasks, {
  ChatGPTFunctionCallModel,
  DandoriTask,
  OptionalTaskPropsOption,
} from "@dandori/core";

const { actualLoadFile } = await vi.hoisted(async () => {
  const actualModule = await import("@dandori/libs");
  return {
    actualLoadFile: actualModule.loadFile,
  };
});

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

const mockLogError = vi.fn();

vi.mock("@dandori/libs", () => {
  return {
    logLevel: "info",
    getLogger: vi.fn(() => ({
      error: mockLogError,
    })),
    loadFile: actualLoadFile,
  };
});

describe("DandoriCoreCli", () => {
  const mockConsole = vi.spyOn(console, "log").mockImplementation(() => {});
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

  describe("with -m option", () => {
    describe("valid argument", () => {
      const model: ChatGPTFunctionCallModel = "gpt-4-0613";

      beforeEach(async () => {
        loadProcessArgv(["-m", model]);
        await new DandoriCoreCli().run();
      });

      it("call generateDandoriTasks with valid model", () => {
        expect(generateDandoriTasks).toHaveBeenCalledWith(inputFileText, {
          envFilePath: undefined,
          chatGPTModel: model,
          optionalTaskProps: undefined,
        });
      });
    });

    describe("invalid argument", () => {
      const model = "invalid-model";
      const supportedChatGPTModels: ChatGPTFunctionCallModel[] = [
        "gpt-3.5-turbo-0613",
        "gpt-4-0613",
      ];
      const expectedMessage = `Unsupported model: ${model}. Supported models are ${supportedChatGPTModels.join(
        ", ",
      )}`;

      beforeEach(() => {
        loadProcessArgv(["-m", model]);
      });

      it("throw Error with valid message", async () => {
        await expect(new DandoriCoreCli().run()).rejects.toThrow(
          expectedMessage,
        );
      });

      it("call logger.error with valid message", async () => {
        try {
          await new DandoriCoreCli().run();
        } catch {
          expect(mockLogError).toHaveBeenCalledWith(expectedMessage);
        }
      });
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
        chatGPTModel: undefined,
        optionalTaskProps: undefined,
      });
    });
  });

  describe("with -o option", () => {
    describe("valid argument", () => {
      const optionalTaskProps = "deadline,description";

      beforeEach(async () => {
        loadProcessArgv(["-o", optionalTaskProps]);
        await new DandoriCoreCli().run();
      });

      it("call generateDandoriTasks with valid optionalTaskProps", () => {
        expect(generateDandoriTasks).toHaveBeenCalledWith(inputFileText, {
          envFilePath: undefined,
          chatGPTModel: undefined,
          optionalTaskProps: optionalTaskProps.split(","),
        });
      });
    });

    describe("invalid argument", () => {
      const optionalTaskProps = "invalid";
      const supportedOptionalTaskProps: OptionalTaskPropsOption = [
        "description",
        "deadline",
        "assignee",
        "status",
        "all",
      ];
      const expectedMessage = `Unsupported optional task props: ${optionalTaskProps}. Supported optional task props are ${supportedOptionalTaskProps.join(
        ", ",
      )}`;

      beforeEach(() => {
        loadProcessArgv(["-o", optionalTaskProps]);
      });

      it("throw Error with valid message", async () => {
        await expect(new DandoriCoreCli().run()).rejects.toThrow(
          expectedMessage,
        );
      });

      it("call logger.error with valid message", async () => {
        try {
          await new DandoriCoreCli().run();
        } catch {
          expect(mockLogError).toHaveBeenCalledWith(expectedMessage);
        }
      });
    });
  });
});
