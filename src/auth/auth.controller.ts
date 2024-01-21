import { AuthService } from '@/auth/auth.service';
import { AuthLoginDto } from '@/auth/dto/auth-login.dto';
import { AuthRefreshResponseDto } from '@/auth/dto/auth-refresh-response.dto';
import { AuthResponseDto } from '@/auth/dto/auth.response.dto';
import { JwtRefreshAuthGuard } from '@/auth/guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ExpressSession } from '@/types/express-session/express-session.types';
import { UserEntity } from '@/user/entities/user.entity';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { SessionTokenStatus } from '@prisma/client';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login user
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: AuthLoginDto,
  })
  async login(
    @User() user: UserEntity,
    @Session() session: ExpressSession,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.authorize(user, session);

    return { user, ...tokens };
  }

  /**
   * Logout user, deletes session
   * @param session
   */
  @Post('logout')
  @ApiNoContentResponse()
  @HttpCode(204)
  async logout(@Session() session: ExpressSession) {
    await this.authService.invalidateSession(session, {
      status: SessionTokenStatus.LOGOUT,
    });
  }

  /**
   * Get new access token
   */
  @Get('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @User() user: UserEntity,
    @Session() session: ExpressSession,
  ): Promise<AuthRefreshResponseDto> {
    return await this.authService.refreshSessionToken(user, session);
  }
}
