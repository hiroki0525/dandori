import { CardItem, MiroApi } from "@mirohq/miro-api";
import { DandoriTask } from "@dandori/core";

export type GenerateDandoriMiroCardsOptions = {
  miroAccessToken?: string;
  boardId?: Parameters<MiroApi["getBoard"]>[0];
};

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
  const taskCardMap = new WeakMap<DandoriTask, CardItem>();
  for await (const task of tasks) {
    const card = await miroBoard.createCardItem({
      data: {
        title: task.name,
        description: task.description,
      },
    });
    taskCardMap.set(task, card);
  }
  const taskMap = tasks.reduce<Record<string, DandoriTask>>((result, task) => {
    result[task.id] = task;
    return result;
  }, {});
  const taskViewRelations: string[] = [];
  const delimiter = "-";
  const getCardIdByTask = (task: DandoriTask): string =>
    (taskCardMap.get(task) as CardItem).id;
  tasks.forEach((task) => {
    const taskUiId = getCardIdByTask(task);
    task.fromTaskIdList.forEach((fromTaskId) => {
      const fromTaskViewId = getCardIdByTask(taskMap[fromTaskId]);
      taskViewRelations.push(`${fromTaskViewId}${delimiter}${taskUiId}`);
    });
    task.toTaskIdList.forEach((toTaskId) => {
      const toTaskViewId = getCardIdByTask(taskMap[toTaskId]);
      taskViewRelations.push(`${taskUiId}${delimiter}${toTaskViewId}`);
    });
  });
  const taskUiIdRelationsList = Array.from(new Set(taskViewRelations)).map(
    (toFrom) => toFrom.split(delimiter),
  );
  for await (const taskUiIdRelations of taskUiIdRelationsList) {
    await miroBoard.createConnector({
      startItem: {
        id: taskUiIdRelations[0],
      },
      endItem: {
        id: taskUiIdRelations[1],
      },
    });
  }
}
