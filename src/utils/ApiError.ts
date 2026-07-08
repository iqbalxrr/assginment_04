export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorDetails: unknown;

  constructor(statusCode: number, message: string, errorDetails: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
