import { AuthResponseDto } from '@/auth/dto/auth.response.dto';
import { OmitType } from '@nestjs/swagger';

export class AuthRefreshResponseDto extends OmitType(AuthResponseDto, [
  'user',
] as const) {}
