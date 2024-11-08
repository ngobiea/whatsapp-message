import type { ValidationError } from 'express-validator';
class CustomError extends Error {
  statusCode: number;
  data = [];
  validationErrors: ValidationError[] = [];

  constructor({
    message,
    statusCode,
    validationErrors,
  }: {
    message: string;
    statusCode: number;
    validationErrors?: ValidationError[];
  }) {
    super(message);
    this.statusCode = statusCode;
    if (validationErrors) {
      this.validationErrors = validationErrors;
    }
  }
}

export default CustomError;
