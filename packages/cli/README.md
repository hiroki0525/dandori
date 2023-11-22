# dandori/cli

This repository is responsible for executing `@dandori/*` packages.

## Installation

```bash
# It isn't necessary to install this package if you use the command like `npx` .
npm install @dandori/cli
yarn add @dandori/cli
pnpm add @dandori/cli
```

## Usage

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
npx -p @dandori/cli dandori-miro your_tasks.txt -b your_miro_board_id
yarn dlx -p @dandori/cli dandori-miro your_tasks.txt -b your_miro_board_id
pnpm --package=@dandori/cli dlx dandori-miro your_tasks.txt -b your_miro_board_id
```

## Requirements

* Please see [`@dandori/core` README]('../core/README.md') and [`@dandori/ui` README]('../ui/README.md') before using `@dandori/cli`.

## Supported External APIs

* [Miro](https://miro.com/)