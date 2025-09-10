import { AppError, AppEvent } from "./events";
import winston from "winston";

const basicLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});

const logger = basicLogger.child({
  service: "vision-web-face-api",
});

export const logError = (error: Error) => {
  const event: AppError = {
    message: "ERROR",
    error: error.message,
    cause: error.cause,
  };
  logger.error(event);
};

export const logInfo = (info: AppEvent) => {
  logger.info(info);
};
