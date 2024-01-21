import { Password } from '@/shared/decorators/password.decorator';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  /**
   * User display name
   * @example "John Doe"
   */
  @IsString()
  @IsOptional()
  name?: string;
  /**
   * User email
   * @example johndoe@email.com
   */
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  /**
   * User password
   * @example #MyStrongPassword1
   */
  @Password()
  password: string;
}
