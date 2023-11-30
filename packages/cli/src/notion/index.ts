import { generateDandoriNotionPages } from "@dandori/ui";
import DandoriCoreCli from "../core";

export default class DandoriNotionCli extends DandoriCoreCli {
  override async run(): Promise<void> {
    const tasks = await this.generateDandoriTasks();
    const opts = this.program.opts();
    await generateDandoriNotionPages(tasks, {
      databaseId: opts.databaseId,
      databasePropertiesMap: {
        name: opts.name,
        deadline: opts.deadline,
        description: opts.description,
        status: opts.status,
        "status.todo": opts.statusTodo,
        "status.doing": opts.statusDoing,
        "status.done": opts.statusDone,
      },
    });
  }

  protected override buildCommand() {
    return super
      .buildCommand()
      .option("-d, --database-id <database-id>", "notion database id")
      .option("--name <name>", "notion page name property")
      .option("--deadline <deadline>", "notion page deadline property")
      .option("--status <status>", "notion page status property")
      .option("--status-todo <status-todo>", "notion page status todo property")
      .option(
        "--status-doing <status-doing>",
        "notion page status doing property",
      )
      .option(
        "--status-done <status-done>",
        "notion page status done property",
      );
  }
}
