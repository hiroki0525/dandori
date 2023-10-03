import { MiroApi } from "@mirohq/miro-api";
import { DandoriTask } from "@dandori/core";

export type GenerateDandoriMiroCardsOptions = {
  miroAccessToken?: string;
  boardId?: Parameters<MiroApi["getBoard"]>[0];
};

const defaultCardMarginX = 100;
const defaultCardMarginY = defaultCardMarginX / 2;

export async function generateDandoriMiroCards(
  tasks: DandoriTask[],
  options?: GenerateDandoriMiroCardsOptions,
): Promise<void> {
  const miroApi = new MiroApi(
    options?.miroAccessToken || process.env.MIRO_ACCESS_TOKEN,
  );
  const miroBoard = await miroApi.getBoard(
    options?.boardId || process.env.MIRO_BOARD_ID,
  );
  const taskMap = tasks.reduce<Record<DandoriTask["id"], DandoriTask>>(
    (result, task) => {
      result[task.id] = task;
      return result;
    },
    {},
  );
  const taskRelations: string[] = [];
  const delimiter = "-";
  tasks.forEach((task) => {
    const taskId = task.id;
    task.fromTaskIdList.forEach((fromTaskId) => {
      taskRelations.push(`${fromTaskId}${delimiter}${taskId}`);
    });
    task.toTaskIdList.forEach((toTaskId) => {
      taskRelations.push(`${taskId}${delimiter}${toTaskId}`);
    });
  });
  const taskFromToIdsList = Array.from(new Set(taskRelations)).map((toFrom) =>
    toFrom.split(delimiter),
  );
  for await (const taskFromToIds of taskFromToIdsList) {
    for await (const task of tasks) {
      const card = await miroBoard.createCardItem({
        data: {
          title: task.name,
          description: task.description,
        },
      });
    }
    await miroBoard.createConnector({
      startItem: {
        id: taskFromToIds[0],
      },
      endItem: {
        id: taskFromToIds[1],
      },
    });
  }
}
