import { configDotenv } from "dotenv";
import { loadFile } from "./loadFile";
import { logger } from "./logger";

export function loadEnvFile(filePath: string = ".env"): void {
  const loadEnvResult = configDotenv({
    path: loadFile(filePath),
  });
  if (loadEnvResult.error) {
    logger.error(loadEnvResult.error);
    throw loadEnvResult.error;
  }
}
