export interface AuthToken {
  /**
   * Access token
   */
  access_token: string;

  /**
   * Access token expiration
   */
  at_expiry: number;
}

export interface AuthTokenWithRefreshToken extends AuthToken {
  /**
   * Refresh token
   */
  refresh_token: string;
}
