import { logger } from "./logger";

export async function runPromisesSequentially<T>(
  runPromises: (() => Promise<T>)[],
  runningLogPrefix: string,
): Promise<T[]> {
  let currentRunPromiseCount = 0;
  const maxRunPromiseCount = runPromises.length;
  const timeId = setInterval(() => {
    logger.info(
      `${runningLogPrefix}... (${currentRunPromiseCount}/${maxRunPromiseCount})`,
    );
  }, 5000);
  const results: T[] = [];
  for (const runPromise of runPromises) {
    try {
      results.push(await runPromise());
    } catch (e) {
      clearInterval(timeId);
      throw e;
    }
    currentRunPromiseCount++;
  }
  clearInterval(timeId);
  logger.info(`${runningLogPrefix}... Done!`);
  return results;
}
