import { generateDandoriMiroCards } from "@dandori/ui";
import DandoriCoreCli from "../core";

export default class DandoriMiroCli extends DandoriCoreCli {
  override async run(): Promise<void> {
    const tasks = await this.generateDandoriTasks();
    const opts = this.program.opts();
    await generateDandoriMiroCards(tasks, {
      boardId: opts.boardId,
      isAppCard: opts.appCard,
    });
  }

  protected override buildCommand() {
    return super
      .buildCommand()
      .option("-a, --app-card")
      .option("-b, --board-id <board-id>");
  }
}
