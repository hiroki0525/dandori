#!/usr/bin/env node

import packageJson from "../package.json";
import { Command } from "commander";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import generateDandoriTasks from "@dandori/core";

let inputFile = "";

const program = new Command(packageJson.name)
  .version(packageJson.version)
  .argument("<input-file>")
  .usage(`${chalk.green("<input-file>")} [options]`)
  .option("-o, --output-file <output-file>")
  .action((iFile) => {
    inputFile = iFile;
  })
  .parse(process.argv);

const opts = program.opts();

const source = await readFile(inputFile);
const tasks = await generateDandoriTasks(source.toString());
const { outputFile } = opts;
const jsonStringTasks = JSON.stringify(tasks, null, 2);
if (outputFile) {
  await writeFile(outputFile, jsonStringTasks);
} else {
  console.log(jsonStringTasks);
}
