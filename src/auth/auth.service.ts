import { AuthToken, AuthTokenWithRefreshToken } from '@/auth/types/auth.types';
import { PrismaService } from '@/prisma/prisma.service';
import { ExpressSession } from '@/types/express-session/express-session.types';
import { UserEntity } from '@/user/entities/user.entity';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionTokenStatus, User } from '@prisma/client';
import * as argon2 from 'argon2';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Validate user credentials.
   * @param email
   * @param  password
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user) {
      const passwordMatches = await argon2.verify(user.password_hash, password);
      if (!passwordMatches) return null;

      delete user.password_hash;

      return user;
    }

    return null;
  }

  /**
   * Authorize session and generate tokens.
   * @param user
   * @param session
   */
  async authorize(
    user: UserEntity,
    session: ExpressSession,
  ): Promise<AuthToken> {
    return await this._initializeSession(user, session);
  }

  /**
   * Refresh session token and updates the
   * previous session token.
   * @param user
   * @param session
   */
  async refreshSessionToken(
    user: UserEntity,
    session: ExpressSession,
  ): Promise<AuthToken> {
    await this.prismaService.sessionToken.update({
      where: { session_id: session.id },
      data: {
        status: SessionTokenStatus.REFRESHED,
        used_at: dayjs().toDate(),
        session_id: '',
      },
    });

    return await this._initializeSession(user, session);
  }

  /**
   * Validate session token.
   * @param session
   */
  async validateSessionToken(session: ExpressSession) {
    const sessionToken = await this.prismaService.sessionToken.findUnique({
      where: { session_id: session.id },
    });

    if (!sessionToken || sessionToken?.status !== SessionTokenStatus.ACTIVE)
      return false;

    return await argon2.verify(sessionToken.token, session.refresh_token);
  }

  /**
   * Destroy session and invalidates session token.
   * Note: this method does not clear cookie.
   * @param session
   * @param options
   * @param {boolean} options.consume if sets to true, token will be marked as used
   * @param {SessionTokenStatus} options.status session token status
   */
  async invalidateSession(
    session: ExpressSession,
    options?: { consume?: boolean; status?: SessionTokenStatus },
  ) {
    console.log(session.id);
    if (!session.refresh_token) return;

    try {
      await this.prismaService.sessionToken.update({
        where: { session_id: session.id },
        data: {
          status: options.status,
          used_at: options?.consume ? dayjs().toDate() : undefined,
          invalidated_at: dayjs().toDate(),
          session_id: '',
        },
      });
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }

    session.destroy((error) => {
      if (error) throw new InternalServerErrorException(error);
    });
  }

  /**
   * Internal: Initialize session and create session token.
   * @param user
   * @param session
   * @private
   */
  private async _initializeSession(
    user: UserEntity,
    session: ExpressSession,
  ): Promise<AuthToken> {
    const { access_token, refresh_token, at_expiry } =
      await this._generateTokens(user.id, user.email);

    session.refresh_token = refresh_token;

    session.save(async (error) => {
      if (error) throw new InternalServerErrorException(error);

      const refreshTokenHash = await argon2.hash(refresh_token);

      await this.prismaService.sessionToken.upsert({
        where: { session_id: session.id },
        create: {
          token: refreshTokenHash,
          user_id: user.id,
          session_id: session.id,
        },
        update: {
          token: refreshTokenHash,
        },
      });
    });

    return { access_token, at_expiry };
  }

  /**
   * Internal: Generate access token and refresh token.
   * @param sub
   * @param username
   * @private
   */
  private async _generateTokens(
    sub: string,
    username: string,
  ): Promise<AuthTokenWithRefreshToken> {
    const { access_token, at_expiry } = this._signAccessToken(sub, username);
    const refresh_token = this._signRefreshToken(sub, username);

    return {
      access_token,
      at_expiry,
      refresh_token,
    };
  }

  /**
   * Internal: sign jwt for access token.
   * @param sub
   * @param username
   * @private
   */
  private _signAccessToken(sub: string, username: string): AuthToken {
    const payload = { sub, username };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const at_expiry = this.jwtService.decode(access_token)['exp'];

    return { access_token, at_expiry };
  }

  /**
   * Internal: sign jwt for refresh token.
   * @param sub
   * @param username
   * @private
   */
  private _signRefreshToken(sub: string, username: string): string {
    const payload = { sub, username };
    return this.jwtService.sign(payload, {
      expiresIn: '120d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
