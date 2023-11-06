import OpenAI from "openai";
import { getLogger, loadEnvFile, runPromisesSequentially } from "@dandori/libs";
import { ChatCompletionMessage } from "openai/resources";

export type ChatGPTFunctionCallModel = "gpt-3.5-turbo-0613" | "gpt-4-0613";

const defaultChatGPTFunctionCallModel: ChatGPTFunctionCallModel =
  "gpt-3.5-turbo-0613";

export type DandoriTask = {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  assignee?: {
    id: string;
    name: string;
  };
  fromTaskIdList: string[];
};

export type DandoriTaskProperty = keyof DandoriTask;

export type DandoriTaskRequiredProperty = Extract<
  DandoriTaskProperty,
  "id" | "name" | "fromTaskIdList"
>;

export type DandoriTaskOptionalProperty = Exclude<
  DandoriTaskProperty,
  DandoriTaskRequiredProperty
>;

export type DandoriTaskOptionalAllProperty = "all";
const dandoriTaskOptionalAllProperty: DandoriTaskOptionalAllProperty = "all";
export type OptionalTaskProps =
  | DandoriTaskOptionalProperty
  | DandoriTaskOptionalAllProperty;
export type OptionalTaskPropsOption = OptionalTaskProps[];
const notIncludeAdditionalAllPropsName = (
  props: OptionalTaskPropsOption,
): props is DandoriTaskOptionalProperty[] =>
  !props.includes(dandoriTaskOptionalAllProperty);

export type GenerateDandoriTasksOptions = {
  chatGPTModel?: ChatGPTFunctionCallModel;
  envFilePath?: string;
  optionalTaskProps?: OptionalTaskPropsOption;
};

type FunctionCallValue = {
  type: "string" | "array" | "object";
  description?: string;
  items?: FunctionCallValue;
  properties?: Record<string, FunctionCallValue>;
};

const excludePropertyPrompt =
  "If not provided, this property shouldn't be included.";
const generateIdPrompt = "If not provided, return generated unique ID.";

const requiredFunctionCallTaskProperties: Record<
  DandoriTaskRequiredProperty,
  FunctionCallValue
> = {
  id: {
    type: "string",
    description: `The task ID. ${generateIdPrompt}`,
  },
  name: {
    type: "string",
    description: "The task name",
  },
  fromTaskIdList: {
    type: "array",
    description: "Task IDs to be executed before this task",
    items: {
      type: "string",
    },
  },
} as const;

const optionalFunctionCallTaskProperties: Record<
  DandoriTaskOptionalProperty,
  FunctionCallValue
> = {
  description: {
    type: "string",
    description: "The task description",
  },
  deadline: {
    type: "string",
    description: `The task deadline which is used by JavaScript Date constructor arguments. ${excludePropertyPrompt}`,
  },
  assignee: {
    type: "object",
    description: `The task assignee. ${excludePropertyPrompt}`,
    properties: {
      id: {
        type: "string",
        description: `The task assignee ID. ${generateIdPrompt}`,
      },
      name: {
        type: "string",
        description: "The task assignee name.",
      },
    },
  },
};

const requiredProperties: readonly DandoriTaskRequiredProperty[] = Object.keys(
  requiredFunctionCallTaskProperties,
) as DandoriTaskRequiredProperty[];

const optionalProperties: readonly DandoriTaskOptionalProperty[] = Object.keys(
  optionalFunctionCallTaskProperties,
) as DandoriTaskOptionalProperty[];

const functionCallName = "get_tasks_flow";

export default async function generateDandoriTasks(
  source: string,
  options?: GenerateDandoriTasksOptions,
): Promise<DandoriTask[]> {
  if (!process.env.OPENAI_API_KEY) {
    loadEnvFile(options?.envFilePath);
  }
  const openai = new OpenAI();
  const model: ChatGPTFunctionCallModel =
    options?.chatGPTModel ?? defaultChatGPTFunctionCallModel;
  const optionalTaskProps = options?.optionalTaskProps ?? [];
  const additionalProperties = notIncludeAdditionalAllPropsName(
    optionalTaskProps,
  )
    ? optionalTaskProps
    : optionalProperties;
  const filteredOptionalFunctionCallTaskProperties = Object.fromEntries(
    additionalProperties.map((additionalProperty) => [
      additionalProperty,
      optionalFunctionCallTaskProperties[additionalProperty],
    ]),
  );
  const [completion] = await runPromisesSequentially(
    [
      () =>
        openai.chat.completions.create({
          messages: [{ role: "user", content: source }],
          model,
          function_call: { name: functionCallName },
          functions: [
            {
              name: functionCallName,
              description:
                "Get the tasks flow which will be used like Gantt chart.",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      required: requiredProperties,
                      properties: {
                        ...requiredFunctionCallTaskProperties,
                        ...filteredOptionalFunctionCallTaskProperties,
                      },
                    },
                  },
                },
              },
            },
          ],
        }) as unknown as Promise<OpenAI.ChatCompletion>,
    ],
    "Generating tasks",
  );

  // https://platform.openai.com/docs/api-reference/chat/create#:~:text=Specifying%20a%20particular%20function%20via%20%7B%22name%22%3A%20%22my_function%22%7D%20forces%20the%20model%20to%20call%20that%20function.
  const resFunctionCall = completion.choices[0].message
    .function_call as ChatCompletionMessage.FunctionCall;
  const { tasks } = JSON.parse(resFunctionCall.arguments);
  getLogger().debug(tasks);
  return tasks as DandoriTask[];
}
