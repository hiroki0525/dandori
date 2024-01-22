import { loadEnvFile } from "@dandori/libs";
import { tasks } from "./mock";
import { generateDandoriNotionPages } from "@dandori/ui";
import { Client } from "@notionhq/client";

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

const notion = new Client({ auth: process.env.NOTION_API_KEY });
async function getDatabaseSchema() {
  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

// check database schema if you want
await getDatabaseSchema();

await generateDandoriNotionPages(tasks, {
  databaseId,
  databasePropertiesMap,
});
