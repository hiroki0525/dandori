import { DandoriTask } from "@dandori/core";
import { generateDandoriMiroCards } from "@dandori/ui";

const tasks: DandoriTask[] = [
  {
    id: "1",
    name: "task1",
    deadline: "2021-01-01",
    description: "task1-description",
    fromTaskIdList: [],
  },
  {
    id: "2",
    name: "task2",
    deadline: "2021-01-02",
    description: "task2-description",
    fromTaskIdList: ["1"],
  },
  {
    id: "3",
    name: "task3",
    deadline: "2021-01-03",
    description: "task3-description",
    fromTaskIdList: ["1"],
  },
  {
    id: "4",
    name: "task4",
    deadline: "2021-01-04",
    description: "task4-description",
    fromTaskIdList: ["2", "3"],
  },
  {
    id: "5",
    name: "task5",
    deadline: "2021-01-05",
    description: "task5-description",
    fromTaskIdList: [],
  },
  {
    id: "6",
    name: "task6",
    deadline: "2021-01-06",
    description: "task6-description",
    fromTaskIdList: ["5"],
  },
  {
    id: "7",
    name: "task7",
    deadline: "2021-01-07",
    description: "task7-description",
    fromTaskIdList: ["5"],
  },
  {
    id: "8",
    name: "task8",
    deadline: "2021-01-08",
    description: "task8-description",
    fromTaskIdList: ["6", "7"],
  },
];

const boardId = "Your board ID";

process.env.MIRO_ACCESS_TOKEN = "Your Miro access token";

await generateDandoriMiroCards(tasks, {
  boardId,
});
