#!/usr/bin/env node

import packageJson from "../package.json";
import { Command } from "commander";
import chalk from "chalk";
import { readFile } from "fs/promises";
import generateDandoriTasks from "@dandori/core";
import { generateDandoriFilePath } from "@dandori/libs";

let inputFile = "";

const program = new Command(packageJson.name)
  .version(packageJson.version)
  .argument("<input-file>")
  .usage(`${chalk.green("<input-file>")} [options]`)
  .option("-e, --env-file <env-file>")
  .action((iFile) => {
    inputFile = iFile;
  })
  .parse(process.argv);

const opts = program.opts();

const source = await readFile(generateDandoriFilePath(inputFile));
const { envFile } = opts;
const tasks = await generateDandoriTasks(source.toString(), {
  envFilePath: envFile,
});
const jsonStringTasks = JSON.stringify(tasks, null, 2);
console.log(jsonStringTasks);
