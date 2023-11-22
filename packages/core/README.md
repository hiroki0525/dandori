# dandori/core

This repository is responsible for generating the task dependency from texts by using AI.

## Installation

```bash
npm install @dandori/core
yarn add @dandori/core
pnpm add @dandori/core
```

## Usage

```ts
import generateDandoriTasks from '@dandori/core';

const texts = `
Today's My Tasks
* Send Email to John
* Send Email to Mary
* Report to Boss after sending emails
`;

const tasks = await generateDandoriTasks(texts);
```

## Requirements

* `@dandori/core` depends on OpenAI API. You need to set `OPENAI_API_KEY` environment variable.
* `@dandori/core` supports to load `.env` file. Please create `.env` file and set `OPENAI_API_KEY` environment variable.