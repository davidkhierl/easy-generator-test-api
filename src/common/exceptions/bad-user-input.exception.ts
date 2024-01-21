import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class BadUserInputException extends BadRequestException {
  constructor(validationErrors: ValidationError[]) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad User Input',
      errors: validationErrors.map((error) =>
        BadUserInputException.formatError(error),
      ),
    });
  }

  private static formatError(validationError: ValidationError) {
    return {
      property: validationError.property,
      value: validationError.value,
      constraints: validationError.constraints,
    };
  }
}
