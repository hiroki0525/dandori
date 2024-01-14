import { loadEnvFile } from "@dandori/libs";
import { tasks } from "./mock";
import { generateDandoriTrelloCards } from "../src/trello/trello";

// set environment variables like access token
loadEnvFile();

// set trello settings
const boardId = "";
const trelloListPropertiesMap = {
  "status.todo": "",
  "status.doing": "",
  "status.done": "",
};

await generateDandoriTrelloCards(tasks, {
  boardId,
  trelloListPropertiesMap,
});
