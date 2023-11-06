import { getLogger } from "./logger";

export async function runPromisesSequentially<T>(
  runPromises: (() => Promise<T>)[],
  runningLogPrefix: string,
): Promise<T[]> {
  const logger = getLogger();
  let currentRunPromiseCount = 0;
  const maxRunPromiseCount = runPromises.length;
  const timeId = setInterval(() => {
    logger.info(
      `${runningLogPrefix}... (${currentRunPromiseCount}/${maxRunPromiseCount})`,
    );
  }, 5000);
  const results: T[] = [];
  for (const runPromise of runPromises) {
    currentRunPromiseCount++;
    try {
      results.push(await runPromise());
    } catch (e) {
      clearInterval(timeId);
      logger.error(e);
      throw e;
    }
  }
  clearInterval(timeId);
  logger.info(`${runningLogPrefix}... Done!`);
  return results;
}
