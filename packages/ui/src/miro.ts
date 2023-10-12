import { MiroApi } from "@mirohq/miro-api";
import { DandoriTask } from "@dandori/core";
import FlatToNested from "flat-to-nested";
import TreeModel, { NodeVisitorFunction } from "tree-model";
import { logger, runPromisesSequentially } from "@dandori/libs";

export type GenerateDandoriMiroCardsOptions = {
  miroAccessToken?: string;
  boardId?: Parameters<MiroApi["getBoard"]>[0];
  isAppCard?: boolean;
};

// miro settings
const defaultCardMarginX = 130;
const defaultCardMarginY = defaultCardMarginX / 2;
const defaultCardWidth = defaultCardMarginX * 2; // min: 256
const defaultCardHeight = defaultCardMarginY * 2;

// tree model js settings
const taskParentPropName = "fromTaskId";
const taskChildrenPropName = "nextTasks";
const flatToNested = new FlatToNested({
  parent: taskParentPropName,
  children: taskChildrenPropName,
});
const tree = new TreeModel({
  childrenPropertyName: taskChildrenPropName,
});
type DandoriTaskWithNextTasks = DandoriTask & {
  [taskChildrenPropName]?: DandoriTaskWithNextTasks[];
};

function iterateBreadthNodes<T>(
  nodes: TreeModel.Node<T>[],
  callback: NodeVisitorFunction<T>,
): void {
  nodes.forEach((node) => {
    node.walk({ strategy: "breadth" }, callback, undefined);
  });
}

export async function generateDandoriMiroCards(
  tasks: DandoriTask[],
  options?: GenerateDandoriMiroCardsOptions,
): Promise<void> {
  const miroApi = new MiroApi(
    options?.miroAccessToken || process.env.MIRO_ACCESS_TOKEN,
    undefined,
    (...thing) => {
      logger.debug(thing);
    },
  );
  const miroBoard = await miroApi.getBoard(
    options?.boardId || process.env.MIRO_BOARD_ID,
  );
  const taskFlat: (DandoriTask & { [taskParentPropName]?: string })[] = tasks
    .map((task) =>
      task.fromTaskIdList.length === 0
        ? task
        : task.fromTaskIdList.map((fromTaskId) => ({
            ...task,
            [taskParentPropName]: fromTaskId,
          })),
    )
    .flat();
  const convertedFlatToNestedTasks = flatToNested.convert(taskFlat);
  const nestedTasks: DandoriTaskWithNextTasks[] = Array.isArray(
    convertedFlatToNestedTasks,
  )
    ? convertedFlatToNestedTasks
    : [convertedFlatToNestedTasks];
  const taskNodes = nestedTasks.map((nestedTask) => tree.parse(nestedTask));
  const runCreateCardPromises: (() => Promise<void>)[] = [];
  const taskIdCardIdMap = new Map<string, string>();
  iterateBreadthNodes(taskNodes, (node) => {
    const task = node.model as DandoriTaskWithNextTasks;
    const baseCardParams = {
      data: {
        title: task.name,
        description: task.description,
      },
      geometry: {
        width: defaultCardWidth,
        height: defaultCardHeight,
      },
      position: {
        x:
          (defaultCardMarginX + defaultCardWidth) * (node.getPath().length - 1),
        y: (defaultCardMarginY + defaultCardHeight) * node.getIndex(),
      },
    };
    const createCard = options?.isAppCard
      ? () => miroBoard.createAppCardItem(baseCardParams)
      : () => {
          const mergedDataParams = {
            ...baseCardParams.data,
            dueDate: task.deadline ? new Date(task.deadline) : undefined,
          };
          return miroBoard.createCardItem({
            ...baseCardParams,
            data: mergedDataParams,
          });
        };
    runCreateCardPromises.push(async () => {
      const card = await createCard();
      taskIdCardIdMap.set(task.id, card.id);
    });
    return true;
  });
  await runPromisesSequentially(runCreateCardPromises, "Creating cards");

  const runCreateConnectorPromises: (() => Promise<void>)[] = [];
  iterateBreadthNodes(taskNodes, (node) => {
    const task = node.model as DandoriTaskWithNextTasks;
    const nextTasks = task[taskChildrenPropName];
    if (!nextTasks?.length) {
      return true;
    }
    const startCardId = taskIdCardIdMap.get(task.id);
    nextTasks.forEach((nextTask) => {
      runCreateConnectorPromises.push(async () => {
        await miroBoard.createConnector({
          startItem: {
            id: startCardId,
          },
          endItem: {
            id: taskIdCardIdMap.get(nextTask.id),
          },
        });
      });
    });
    return true;
  });
  await runPromisesSequentially(
    runCreateConnectorPromises,
    "Creating connectors",
  );
  logger.info("Create miro cards and connectors successfully!");
}
