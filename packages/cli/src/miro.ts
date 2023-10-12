#!/usr/bin/env node

import { DandoriBaseCli } from "./libs";
import { generateDandoriMiroCards } from "@dandori/ui";

class DandoriMiroCli extends DandoriBaseCli {
  override buildCommand() {
    return super
      .buildCommand()
      .option("-a, --app-card")
      .option("-b, --board-id <board-id>");
  }
}

const cli = new DandoriMiroCli();
const tasks = await cli.generateDandoriTasks();
await generateDandoriMiroCards(tasks);
