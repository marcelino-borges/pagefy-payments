import log from "../logs";

export class AppError extends Error {
  readonly statusCode?: number;
  readonly originalError?: Error;

  constructor(message: string, statusCode?: number, originalError?: Error) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;

    log.error(`Error: ${message}. Details: ${originalError}`);
  }
}
