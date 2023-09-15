import "dotenv/config";
import OpenAI from "openai";

export type ChatGPTFunctionCallModel = "gpt-3.5-turbo-0613" | "gpt-4-0613";

const defaultChatGPTFunctionCallModel: ChatGPTFunctionCallModel =
  "gpt-3.5-turbo-0613";

export type GenerateDandoriTasksOptions = {
  chatGPTModel?: ChatGPTFunctionCallModel;
  openaiApiKey?: string;
};

export type DandoriTask = {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  assignee?: string;
  toTaskIdList: string[];
  fromTaskIdList: string[];
};

type FunctionCallValue = {
  type: "string" | "array";
  description?: string;
  items?: FunctionCallValue;
};

const functionCallTaskProperties: Record<keyof DandoriTask, FunctionCallValue> =
  {
    id: {
      type: "string",
      description: "The task ID. If not provided, return generated unique ID",
    },
    name: {
      type: "string",
      description: "The task name",
    },
    description: {
      type: "string",
      description: "The task description",
    },
    deadline: {
      type: "string",
      description: "The task deadline",
    },
    assignee: {
      type: "string",
      description: "The task assignee",
    },
    toTaskIdList: {
      type: "array",
      description: "Task IDs to be executed after this task",
      items: {
        type: "string",
      },
    },
    fromTaskIdList: {
      type: "array",
      description: "Task IDs to be executed before this task",
      items: {
        type: "string",
      },
    },
  } as const;

const functionCallName = "get_tasks_flow";

export default async function generateDandoriTasks(
  source: string,
  options?: GenerateDandoriTasksOptions,
): Promise<DandoriTask[] | null> {
  const openai = new OpenAI({
    apiKey: options?.openaiApiKey ?? process.env.OPENAI_API_KEY,
  });
  const model: ChatGPTFunctionCallModel =
    options?.chatGPTModel ?? defaultChatGPTFunctionCallModel;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: source }],
    model,
    function_call: { name: functionCallName },
    functions: [
      {
        name: functionCallName,
        description: `Get the tasks flow which will be used like Gantt chart.`,
        parameters: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "name", "to", "from"],
                properties: functionCallTaskProperties,
              },
            },
          },
        },
      },
    ],
  });

  const resFunctionCall = completion.choices[0].message.function_call;
  if (!resFunctionCall) {
    return null;
  }
  const { tasks } = JSON.parse(resFunctionCall.arguments);
  console.dir(tasks, { depth: null });

  return tasks as DandoriTask[];
}

// const test = `
// My tasks
// * Send email to John
// * Send email to Mary
// * Send email to Peter
// * Report to your supervisor that I sent email to John, Mary and Peter
// `;
//
// generateDandoriTasks(test);