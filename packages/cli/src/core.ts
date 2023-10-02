#!/usr/bin/env node

import { DandoriBaseCli } from "./libs";

const cli = new DandoriBaseCli();
const tasks = await cli.generateDandoriTasks();
const jsonStringTasks = JSON.stringify(tasks, null, 2);
console.log(jsonStringTasks);
