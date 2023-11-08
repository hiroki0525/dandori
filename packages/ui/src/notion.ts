import {
  DandoriTask,
  DandoriTaskOptionalProperty,
  DandoriTaskRequiredProperty,
  DandoriTaskStatus,
} from "@dandori/core";
import { Client } from "@notionhq/client";
import { runPromisesSequentially } from "@dandori/libs";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

type SupportNotionTaskOptionalProperty =
  | Exclude<DandoriTaskOptionalProperty, "assignee">
  | `${Extract<DandoriTaskOptionalProperty, "status">}.${DandoriTaskStatus}`;

type DatabasePropertiesMap = {
  [key in SupportNotionTaskOptionalProperty]?: string;
} & { [key in Extract<DandoriTaskRequiredProperty, "name">]?: string };

export type GenerateDandoriNotionDatabaseItemsOptions = {
  databaseId: string;
  databasePropertiesMap: DatabasePropertiesMap;
};

const createPageParams = (
  task: DandoriTask,
  options: GenerateDandoriNotionDatabaseItemsOptions,
): CreatePageParameters => {
  const propsMap = options.databasePropertiesMap;
  const { deadline, description, status, name } = task;
  const {
    deadline: deadlineProp,
    description: descriptionProp,
    status: statusProp,
    name: nameProp = "Name",
  } = propsMap;
  const pageProperties: Record<string, any> = {
    [nameProp]: {
      title: [
        {
          text: {
            content: name,
          },
        },
      ],
    },
  };
  if (descriptionProp) {
    pageProperties[descriptionProp] = {
      rich_text: [
        {
          text: {
            content: description,
          },
        },
      ],
    };
  }
  if (deadline && deadlineProp) {
    // start date must be before end date in Notion
    const today = new Date();
    if (today < new Date(deadline)) {
      pageProperties[deadlineProp] = {
        date: {
          start: today.toISOString(),
          end: deadline,
        },
      };
    }
  }
  if (status && statusProp) {
    const statusName = propsMap[`status.${status}`];
    if (statusName) {
      pageProperties[statusProp] = {
        select: {
          name: statusName,
        },
      };
    }
  }
  return {
    parent: {
      database_id: options.databaseId,
    },
    properties: pageProperties,
  };
};

export default async function generateDandoriNotionPages(
  tasks: DandoriTask[],
  options: GenerateDandoriNotionDatabaseItemsOptions,
): Promise<void> {
  const client = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  const createPages = tasks.map((task) => () => {
    const pageParams = createPageParams(task, options);
    return client.pages.create(pageParams);
  });
  await runPromisesSequentially(createPages, "Creating Notion Pages");
}
