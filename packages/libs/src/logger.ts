import { createLogger, format, transports } from "winston";

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

export type LogLevel = typeof process.env.LOG_LEVEL;

export const getLogLevel = (): LogLevel => {
  return process.env.LOG_LEVEL ?? "info";
};

export const getLogger = (): Logger => {
  if (!logger) {
    const logger = createLogger({
      level: getLogLevel(),
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        format.splat(),
        format.json(),
        format.printf((info) => {
          return `[${info.timestamp}] ${info.level} : ${info.message}`;
        }),
      ),
      transports: [new transports.Console()],
    });
    setLogger(logger);
  }
  return logger;
};
