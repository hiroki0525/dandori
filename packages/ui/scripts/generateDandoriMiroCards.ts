import { loadEnvFile } from "@dandori/libs";
import { generateDandoriMiroCards } from "@dandori/ui";
import { tasks } from "./mock";

// set environment variables like access token
loadEnvFile();

const boardId = "Your board ID";

await generateDandoriMiroCards(tasks, {
  boardId,
});
