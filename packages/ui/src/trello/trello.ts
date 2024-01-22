import { DandoriTask, DandoriTaskStatus } from "@dandori/core";
import { checkApiKey, runPromisesSequentially } from "@dandori/libs";
import { TrelloClient } from "./client";

export type TrelloListPropertiesMap =
  | {
      "status.todo": string;
      "status.doing"?: string;
      "status.done"?: string;
    }
  | {
      "status.todo"?: string;
      "status.doing": string;
      "status.done"?: string;
    }
  | {
      "status.todo"?: string;
      "status.doing"?: string;
      "status.done": string;
    };

export type GenerateDandoriTrelloCardsOptions = {
  boardId: string;
  apiKey?: string;
  apiToken?: string;
  trelloListPropertiesMap: TrelloListPropertiesMap;
};

const targetName = "trello";

export async function generateDandoriTrelloCards(
  tasks: DandoriTask[],
  options: GenerateDandoriTrelloCardsOptions,
): Promise<void> {
  const key = checkApiKey(
    `${targetName} api key`,
    process.env.TRELLO_API_KEY,
    options.apiKey,
  );
  const token = checkApiKey(
    `${targetName} api token`,
    process.env.TRELLO_API_TOKEN,
    options.apiToken,
  );
  const trello = new TrelloClient(key, token);
  const lists = await trello.getLists(options.boardId);
  const { trelloListPropertiesMap } = options;
  const statusNames = [
    trelloListPropertiesMap["status.todo"],
    trelloListPropertiesMap["status.doing"],
    trelloListPropertiesMap["status.done"],
  ];
  const listIds = statusNames.map((statusName) => {
    const list = lists.find((list) => list.name === statusName);
    if (list) {
      return list.id;
    }
  });
  const dandoriTaskListIdMap: Record<DandoriTaskStatus, string | undefined> = {
    todo: listIds[0],
    doing: listIds[1],
    done: listIds[2],
  };
  const createCards: (() => Promise<void>)[] = [];
  tasks.forEach((task) => {
    const taskStatus = task.status;
    if (!taskStatus) {
      return;
    }
    const listId = dandoriTaskListIdMap[taskStatus];
    if (!listId) {
      return;
    }
    createCards.push(() => trello.createCard({ listId, name: task.name }));
  });
  await runPromisesSequentially(createCards, "Creating Trello Cards");
}
