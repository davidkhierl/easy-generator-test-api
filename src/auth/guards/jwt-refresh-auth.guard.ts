import { AuthService } from '@/auth/auth.service';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err: unknown, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !user || info) {
      if (request.session.refresh_token) {
        void this.authService.invalidateSession(request.session, {
          consume: true,
          // status: SessionTokenStatus.EXPIRED,
        });
        request.res.clearCookie('sid');
      }

      throw err || new UnauthorizedException();
    }

    return user;
  }
}
