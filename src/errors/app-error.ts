class AppResult {
  public readonly message: string;
  public readonly errorDetails: string | null;
  public readonly statusCode: number;

  constructor(
    message: string,
    errorDetails: string | null = null,
    statusCode: number = 400
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
}

export default AppResult;
