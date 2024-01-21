import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsSpecialChar(validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      name: 'containsSpecialChar',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must contain at least one special character`,
        ...validationOptions,
      },
      validator: {
        validate(value: string): Promise<boolean> | boolean {
          const containsSpecialChar = /(?=.*?[#?!@$%^&*-])/;

          return containsSpecialChar.test(value);
        },
      },
    });
  };
}
