import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsUpperLetter(validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      name: 'containsUpperLetter',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must contain at least one upper case letter`,
        ...validationOptions,
      },
      validator: {
        validate(value: string): Promise<boolean> | boolean {
          const containsUpperLetter = /(?=.*?[A-Z])/;

          return containsUpperLetter.test(value);
        },
      },
    });
  };
}
