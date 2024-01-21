import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsLowerLetter(validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      name: 'containsLowerLetter',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must contain at least one lower case letter`,
        ...validationOptions,
      },
      validator: {
        validate(value: string): Promise<boolean> | boolean {
          const containsLowerLetter = /(?=.*?[a-z])/;

          return containsLowerLetter.test(value);
        },
      },
    });
  };
}
