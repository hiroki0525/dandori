import pino from "pino";

export type Logger = {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  [key: string | number | symbol]: any;
};

let logger: Logger;

export const setLogger = (newLogger: Logger): void => {
  logger = newLogger;
};

export const logLevel = process.env.LOG_LEVEL ?? "info";

export const getLogger = (): Logger => {
  if (!logger) {
    setLogger(
      pino({
        name: "dandori",
        level: logLevel,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }),
    );
  }
  return logger;
};
