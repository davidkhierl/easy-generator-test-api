import { AuthToken } from '@/auth/types/auth.types';
import { UserEntity } from '@/user/entities/user.entity';

/**
 * Auth response object
 */
export class AuthResponseDto implements AuthToken {
  /**
   * User data
   */
  user: UserEntity;
  /**
   * Access token
   */
  access_token: string;

  /**
   * Access token expiration
   */
  at_expiry: number;
}
