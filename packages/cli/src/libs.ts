import packageJson from "../package.json";
import { Command } from "commander";
import chalk from "chalk";
import generateDandoriTasks, { DandoriTask } from "@dandori/core";
import { readFile } from "fs/promises";
import { generateDandoriFilePath } from "@dandori/libs";

export class DandoriBaseCli {
  private program: Command;
  private inputFile: string = "";

  constructor() {
    this.program = new Command(packageJson.name)
      .version(packageJson.version)
      .argument("<input-file>")
      .usage(`${chalk.green("<input-file>")} [options]`)
      .option("-e, --env-file <env-file>")
      .action((iFile) => {
        this.inputFile = iFile;
      });
  }

  async generateDandoriTasks(): Promise<DandoriTask[]> {
    this.program.parse(process.argv);
    const opts = this.program.opts();
    const source = await readFile(generateDandoriFilePath(this.inputFile));
    const { envFile } = opts;
    const tasks = await generateDandoriTasks(source.toString(), {
      envFilePath: envFile,
    });
    if (!tasks) {
      console.error("Failed to generate dandori tasks.");
      process.exit(1);
    }
    return tasks;
  }
}
