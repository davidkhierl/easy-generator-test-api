import { AuthLoginDto } from '@/auth/dto/auth-login.dto';
import { BadUserInputException } from '@/common/exceptions/bad-user-input.exception';
import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
} from '@nestjs/common';
import { ValidationError, validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthDtoValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const auth = new AuthLoginDto();
    Object.keys(body).forEach((key) => {
      auth[key] = body[key];
    });

    try {
      await validateOrReject(auth);
    } catch (errors) {
      if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
        throw new BadUserInputException(errors);
      }

      throw new InternalServerErrorException();
    }

    next();
  }
}
