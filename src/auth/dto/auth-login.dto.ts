import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  /**
   * Login email
   * @example johndoe@email.com
   */
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Login password
   * @example #MyStrongPassword1
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
