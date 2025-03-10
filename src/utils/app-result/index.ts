import { HttpStatusCode } from "axios";
import { AppError } from "../app-error";
import { AppErrorsMessages } from "@/constants";

class AppResult {
  public readonly message: string;
  public readonly errorDetails: string | null;
  public readonly statusCode: number;

  constructor(
    message: string,
    errorDetails: string | null = null,
    statusCode: number = HttpStatusCode.BadRequest
  ) {
    this.message = message;
    this.errorDetails = errorDetails;
    this.statusCode = statusCode;
  }

  public isError() {
    return (
      String(this.statusCode)[0] === "4" || String(this.statusCode)[0] === "5"
    );
  }

  public static fromError(error: any) {
    if (error instanceof AppError) {
      return new AppResult(
        error.message,
        error.message,
        error.statusCode ?? HttpStatusCode.InternalServerError
      );
    }

    return new AppResult(
      AppErrorsMessages.INTERNAL_ERROR,
      error.message,
      HttpStatusCode.InternalServerError
    );
  }

  public static buildForbidden(forbiddenDetails?: string) {
    return new AppResult(
      AppErrorsMessages.FORBIDDEN,
      forbiddenDetails,
      HttpStatusCode.Forbidden
    );
  }
}

export default AppResult;
