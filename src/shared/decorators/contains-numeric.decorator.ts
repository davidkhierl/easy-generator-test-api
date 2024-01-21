import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsNumeric(validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string) {
    registerDecorator({
      name: 'containsNumeric',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must contain at least one numeric character`,
        ...validationOptions,
      },
      validator: {
        validate(value: string): Promise<boolean> | boolean {
          const containsNumeric = /(?=.*?[0-9])/;

          return containsNumeric.test(value);
        },
      },
    });
  };
}
