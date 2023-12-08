import {
  DandoriTask,
  DandoriTaskOptionalProperty,
  DandoriTaskRequiredProperty,
  DandoriTaskStatus,
} from "@dandori/core";
import { Client, LogLevel } from "@notionhq/client";
import {
  checkApiKey,
  getLogger,
  getLogLevel,
  runPromisesSequentially,
} from "@dandori/libs";

type SupportNotionTaskOptionalProperty = Exclude<
  DandoriTaskOptionalProperty,
  "assignee" | "status"
>;

type BaseDatabasePropertiesMap = {
  [key in SupportNotionTaskOptionalProperty]?: string;
} & { [key in Extract<DandoriTaskRequiredProperty, "name">]?: string };

type DandoriStatusProperty = Extract<DandoriTaskOptionalProperty, "status">;

type StatusDatabasePropertiesMap = Record<
  `${DandoriStatusProperty}.${DandoriTaskStatus}` & DandoriStatusProperty,
  string
>;

type StatusTodoDatabasePropertiesMap = StatusDatabasePropertiesMap & {
  status: string;
  "status.todo": string;
  "status.doing"?: string;
  "status.done"?: string;
} & BaseDatabasePropertiesMap;

type StatusDoingDatabasePropertiesMap = StatusDatabasePropertiesMap & {
  status: string;
  "status.todo"?: string;
  "status.doing": string;
  "status.done"?: string;
} & BaseDatabasePropertiesMap;

type StatusDoneDatabasePropertiesMap = StatusDatabasePropertiesMap & {
  status: string;
  "status.todo"?: string;
  "status.doing"?: string;
  "status.done": string;
} & BaseDatabasePropertiesMap;

type DatabasePropertiesMapWithStatus =
  | StatusTodoDatabasePropertiesMap
  | StatusDoingDatabasePropertiesMap
  | StatusDoneDatabasePropertiesMap;

export type DatabasePropertiesMap =
  | BaseDatabasePropertiesMap
  | DatabasePropertiesMapWithStatus;

export type GenerateDandoriNotionPagesOptions = {
  databaseId: string;
  databasePropertiesMap?: DatabasePropertiesMap;
  apiKey?: Parameters<typeof checkApiKey>[2];
};

const hasStatusProperty = (
  value: DatabasePropertiesMap,
): value is DatabasePropertiesMapWithStatus => {
  return "status" in value;
};

const createPageParams = (
  task: DandoriTask,
  options: GenerateDandoriNotionPagesOptions,
): Parameters<InstanceType<typeof Client>["pages"]["create"]>[0] => {
  const propsMap = options.databasePropertiesMap ?? {};
  const { deadline, description, status, name } = task;
  const {
    deadline: deadlineProp,
    description: descriptionProp,
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
  if (description && descriptionProp) {
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
  if (status && hasStatusProperty(propsMap)) {
    const statusProp = propsMap.status;
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

const getNotionLogLevel = () => {
  switch (getLogLevel()) {
    case "debug":
      return LogLevel.DEBUG;
    case "warn":
      return LogLevel.WARN;
    case "error":
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
};

export async function generateDandoriNotionPages(
  tasks: DandoriTask[],
  options: GenerateDandoriNotionPagesOptions,
): Promise<void> {
  const key = checkApiKey(
    "notion api key",
    process.env.NOTION_API_KEY,
    options.apiKey,
  );
  const logger = getLogger();
  const client = new Client({
    auth: key,
    logLevel: getNotionLogLevel(),
    logger: (
      level: LogLevel,
      message: string,
      extraInfo: Record<string, unknown>,
    ) => {
      logger[level](message, extraInfo);
    },
  });
  const createPages = tasks.map((task) => () => {
    const pageParams = createPageParams(task, options);
    return client.pages.create(pageParams);
  });
  await runPromisesSequentially(createPages, "Creating Notion Pages");
}
