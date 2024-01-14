import { generateDandoriTrelloCards } from "@dandori/ui";
import DandoriCoreCli from "../core";

export default class DandoriTrelloCli extends DandoriCoreCli {
  override async run(): Promise<void> {
    const tasks = await this.generateDandoriTasks();
    const opts = this.program.opts();
    await generateDandoriTrelloCards(tasks, {
      boardId: opts.boardId,
      trelloListPropertiesMap: {
        "status.todo": opts.statusTodo,
        "status.doing": opts.statusDoing,
        "status.done": opts.statusDone,
      },
    });
  }

  protected override buildCommand() {
    return super
      .buildCommand()
      .option("-b, --board-id <board-id>", "trello board id")
      .option("--status-todo <status-todo>", "trello list status todo name")
      .option("--status-doing <status-doing>", "trello list status doing name")
      .option("--status-done <status-done>", "trello list status done name");
  }
}
