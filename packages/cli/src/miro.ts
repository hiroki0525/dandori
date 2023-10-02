#!/usr/bin/env node

import { DandoriBaseCli } from "./libs";
import { generateDandoriMiroCards } from "@dandori/ui";

const cli = new DandoriBaseCli();
const tasks = await cli.generateDandoriTasks();
await generateDandoriMiroCards(tasks);
