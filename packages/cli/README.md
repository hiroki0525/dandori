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
npx --package=@dandori/cli -- miro your_tasks.txt -b your_miro_board_id
yarn dlx -p @dandori/cli miro your_tasks.txt -b your_miro_board_id
pnpm --package=@dandori/cli dlx miro your_tasks.txt -b your_miro_board_id
```

## Requirements

* Please see [@dandori/core](../core/README.md) and [@dandori/ui](../ui/README.md) before using `@dandori/cli`.

## Commands

### core

This command is to execute `generateDandoriTasks` of `@dandori/core`.

```bash
% pnpm --package=@dandori/cli dlx core -h
Options:
  -V, --version                                    output the version number
  -e, --env-file <env-file>                        env file path
  -m, --model <model>                              Chat GPT model which supports function_calling
  -o, --optional-task-props <optional-task-props>  optional output task props which delimiter is a comma
  -h, --help                                       display help for command
```

### miro

This command is to execute `generateDandoriMiroCards` of `@dandori/ui`.

```bash
% pnpm --package=@dandori/cli dlx miro -h

Options:
  -V, --version                                    output the version number
  -e, --env-file <env-file>                        env file path
  -m, --model <model>                              Chat GPT model which supports function_calling
  -o, --optional-task-props <optional-task-props>  optional output task props which delimiter is a comma
  -a, --app-card
  -b, --board-id <board-id>
  -h, --help                                       display help for command
```

## Supported External APIs

* [Miro](https://miro.com/)