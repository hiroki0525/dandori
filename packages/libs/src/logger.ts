import pino from "pino";

export const logger = pino({
  name: "dandori",
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
