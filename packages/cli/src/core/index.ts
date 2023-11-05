import packageJson from "../../package.json";
import { Command } from "commander";
import chalk from "chalk";
import generateDandoriTasks, {
  ChatGPTFunctionCallModel,
  DandoriTask,
  OptionalTaskPropsOption,
} from "@dandori/core";
import { readFile } from "fs/promises";
import { loadFile } from "@dandori/libs";

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
      model?: ChatGPTFunctionCallModel;
    }>();
    // TODO: Error Handling of invalid options
    return generateDandoriTasks(source.toString(), {
      envFilePath: envFile,
      chatGPTModel: model,
      optionalTaskProps: optionalTaskProps?.split(
        ",",
      ) as OptionalTaskPropsOption,
    });
  }
}
