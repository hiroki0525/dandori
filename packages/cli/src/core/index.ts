import packageJson from "../../package.json";
import { Command } from "commander";
import chalk from "chalk";
import generateDandoriTasks, { DandoriTask } from "@dandori/core";
import { readFile } from "fs/promises";
import { generateDandoriFilePath } from "@dandori/libs";

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
      .option("-e, --env-file <env-file>")
      .action((iFile) => {
        this.inputFile = iFile;
      });
  }

  protected async generateDandoriTasks(): Promise<DandoriTask[]> {
    this.program.parse(process.argv);
    const opts = this.program.opts();
    const source = await readFile(generateDandoriFilePath(this.inputFile));
    const { envFile } = opts;
    return generateDandoriTasks(source.toString(), {
      envFilePath: envFile,
    });
  }
}
