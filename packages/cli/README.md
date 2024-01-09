# dandori/cli

This repository is responsible for executing `@dandori/*` packages.

## Usage

This is an example of using Miro.

First, please create `.env` file and set environment variables like below.

```text
OPENAI_API_KEY=your_openai_api_key
MIRO_API_KEY=your_miro_api_key
```

Second, please create a file which contains your tasks like below.

```text
Today's My Tasks
* Send Email to John
* Send Email to Mary
* Report to Boss after sending emails
```

Finally, please execute the following command.

```bash
npx --package=@dandori/cli -- dandori-miro your_tasks.txt -b your_miro_board_id
yarn dlx -p @dandori/cli dandori-miro your_tasks.txt -b your_miro_board_id
pnpm --package=@dandori/cli dlx dandori-miro your_tasks.txt -b your_miro_board_id
```

## Requirements

* Please see [@dandori/core](../core/README.md) and [@dandori/ui](../ui/README.md) before using `@dandori/cli`.

## Supported External APIs

* [Miro](https://miro.com/)
* [Notion](https://www.notion.so/)

## Commands

### dandori-core

This command is to execute `generateDandoriTasks` of `@dandori/core`.

```bash
% pnpm --package=@dandori/cli dlx dandori-core -h
Options:
  -V, --version                                    output the version number
  -e, --env-file <env-file>                        env file path
  -m, --model <model>                              Chat GPT model which supports function_calling
  -o, --optional-task-props <optional-task-props>  optional output task props which delimiter is a comma
  -h, --help                                       display help for command
```

#### Example of the command

```bash
pnpm --package=@dandori/cli dlx dandori-core your_tasks.txt > result.json
```

### dandori-miro

This command is to execute `generateDandoriMiroCards` of `@dandori/ui`.

```bash
% pnpm --package=@dandori/cli dlx dandori-miro -h

Usage: @dandori/cli <input-file> [options]

Options:
  -V, --version                                    output the version number
  -e, --env-file <env-file>                        env file path
  -m, --model <model>                              Chat GPT model which supports function_calling
  -o, --optional-task-props <optional-task-props>  optional output task props which delimiter is a comma
  -a, --app-card                                   use app card
  -b, --board-id <board-id>                        miro board id. if not set, create new board
  -h, --help                                       display help for command
```

#### Example of the command

```bash
pnpm --package=@dandori/cli dlx dandori-miro your_tasks.txt -b your_miro_board_id
```

### dandori-notion

This command is to execute `generateDandoriNotionPages` of `@dandori/ui`.

```bash
% pnpm --package=@dandori/cli dlx dandori-notion -h                                      

Usage: @dandori/cli <input-file> [options]

Options:
  -V, --version                                    output the version number
  -e, --env-file <env-file>                        env file path
  -m, --model <model>                              Chat GPT model which supports function_calling
  -o, --optional-task-props <optional-task-props>  optional output task props which delimiter is a comma
  -d, --database-id <database-id>                  notion database id
  --name <name>                                    notion page name property
  --deadline <deadline>                            notion page deadline property
  --status <status>                                notion page status property
  --status-todo <status-todo>                      notion page status todo property
  --status-doing <status-doing>                    notion page status doing property
  --status-done <status-done>                      notion page status done property
  -h, --help                                       display help for command
```

#### Example of the command

```bash
pnpm --package=@dandori/cli dlx dandori-miro your_tasks.txt -d your_database_id -o status --status 'Status' --status-todo 'ToDo' --status-doing 'Doing' --status-done 'Done 🙌'
```