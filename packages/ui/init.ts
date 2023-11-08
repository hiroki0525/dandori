#!/usr/bin/env node

import { copyFile, mkdir, readdir, rm } from "fs/promises";

const scriptsDir = "./scripts";
const templatesDir = "./templates";

try {
  await rm(scriptsDir, { recursive: true });
} catch {
  // no such file or directory error
}
await mkdir(scriptsDir);
const templateFiles = await readdir(templatesDir);
await Promise.all(
  templateFiles.map(async (templateFile) => {
    const templateFilePath = `${templatesDir}/${templateFile}`;
    const scriptFilePath = `${scriptsDir}/${templateFile}`;
    await copyFile(templateFilePath, scriptFilePath);
  }),
);
