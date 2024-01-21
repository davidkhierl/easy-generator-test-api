import { applyDecorators } from '@nestjs/common';

import { ContainsLowerLetter } from './contains-lower-letter.decorator';
import { ContainsNumeric } from './contains-numeric.decorator';
import { ContainsSpecialChar } from './contains-special-char.decorator';
import { ContainsUpperLetter } from './contains-upper-letter.decorator';

import { MinLength } from 'class-validator';

export function Password() {
  return applyDecorators(
    MinLength(8, { message: 'password must be at least 8 characters' }),
    ContainsLowerLetter(),
    ContainsUpperLetter(),
    ContainsNumeric(),
    ContainsSpecialChar(),
  );
}
