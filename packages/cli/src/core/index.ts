import packageJson from "../../package.json";
import { Command } from "commander";
import chalk from "chalk";
import generateDandoriTasks, {
  ChatGPTFunctionCallModel,
  DandoriTask,
  OptionalTaskProps,
  OptionalTaskPropsOption,
} from "@dandori/core";
import { readFile } from "fs/promises";
import { getLogger, loadFile } from "@dandori/libs";

const supportedChatGPTModels: ChatGPTFunctionCallModel[] = [
  "gpt-3.5-turbo-0613",
  "gpt-4-0613",
];

const isSupportedChatGPTModels = (
  model?: string,
): model is ChatGPTFunctionCallModel | undefined =>
  model === undefined ||
  supportedChatGPTModels.includes(model as ChatGPTFunctionCallModel);

const supportedOptionalTaskProps: OptionalTaskPropsOption = [
  "description",
  "deadline",
  "assignee",
  "status",
  "all",
];

const isSupportedOptionalTaskProps = (
  props?: string[],
): props is OptionalTaskPropsOption | undefined =>
  props === undefined ||
  props.every((prop) =>
    supportedOptionalTaskProps.includes(prop as OptionalTaskProps),
  );

export default class DandoriCoreCli {
  private inputFile: string = "";
  protected program: Command;

  constructor() {
    this.program = this.buildCommand();
  }

  public async run(): Promise<void> {
    const tasks = await this.generateDandoriTasks();
    const jsonStringTasks = JSON.stringify(tasks, null, 2);
    console.log(jsonStringTasks);
  }

  protected buildCommand(): Command {
    return new Command(packageJson.name)
      .version(packageJson.version)
      .argument("<input-file>")
      .usage(`${chalk.green("<input-file>")} [options]`)
      .option("-e, --env-file <env-file>", "env file path")
      .option(
        "-m, --model <model>",
        "Chat GPT model which supports function_calling",
      )
      .option(
        "-o, --optional-task-props <optional-task-props>",
        "optional output task props which delimiter is a comma",
      )
      .action((iFile) => {
        this.inputFile = iFile;
      });
  }

  protected async generateDandoriTasks(): Promise<DandoriTask[]> {
    this.program.parse(process.argv);
    const source = await readFile(loadFile(this.inputFile));
    const { envFile, optionalTaskProps, model } = this.program.opts<{
      envFile?: string;
      optionalTaskProps?: string;
      model?: string;
    }>();
    const logger = getLogger();
    if (!isSupportedChatGPTModels(model)) {
      const logMessage = `Unsupported model: ${model}. Supported models are ${supportedChatGPTModels.join(
        ", ",
      )}`;
      logger.error(logMessage);
      throw new Error(logMessage);
    }
    const inputOptionalTaskProps = optionalTaskProps?.split(",");
    if (!isSupportedOptionalTaskProps(inputOptionalTaskProps)) {
      const logMessage = `Unsupported optional task props: ${optionalTaskProps}. Supported optional task props are ${supportedOptionalTaskProps.join(
        ", ",
      )}`;
      logger.error(logMessage);
      throw new Error(logMessage);
    }
    return generateDandoriTasks(source.toString(), {
      envFilePath: envFile,
      chatGPTModel: model,
      optionalTaskProps: inputOptionalTaskProps,
    });
  }
}
