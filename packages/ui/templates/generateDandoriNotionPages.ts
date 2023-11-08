import { loadEnvFile } from "@dandori/libs";
import { tasks } from "./mock";
import { generateDandoriNotionPages } from "@dandori/ui";

// set environment variables like access token
loadEnvFile();

// set notion settings
const databaseId = "";
const databasePropertiesMap = {
  deadline: "",
  description: "",
  status: "",
  "status.todo": "",
  "status.doing": "",
  "status.done": "",
};

await generateDandoriNotionPages(tasks, {
  databaseId,
  databasePropertiesMap,
});
