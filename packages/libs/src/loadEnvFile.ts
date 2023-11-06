import { configDotenv } from "dotenv";
import { loadFile } from "./loadFile";
import { getLogger } from "./logger";

export function loadEnvFile(filePath: string = ".env"): void {
  const loadEnvResult = configDotenv({
    path: loadFile(filePath),
  });
  if (loadEnvResult.error) {
    getLogger().error(loadEnvResult.error);
    throw loadEnvResult.error;
  }
}
