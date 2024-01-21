import { AuthService } from '@/auth/auth.service';
import { Public } from '@/auth/decorators/public.decorators';
import { Roles } from '@/auth/decorators/roles.decorators';
import { AuthResponseDto } from '@/auth/dto/auth.response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { User } from '@/common/decorators/user.decorator';
import { ExpressSession } from '@/types/express-session/express-session.types';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { UserEntity } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ParseObjectIdPipe } from 'nestjs-object-id';

@Controller('users')
@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Create user
   */
  @Post()
  @Public()
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Created user' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Session() session: ExpressSession,
  ): Promise<AuthResponseDto> {
    const user = await this.userService.create(createUserDto);
    const tokens = await this.authService.authorize(user, session);
    return { user: new UserEntity(user), ...tokens };
  }

  /**
   * Get current user
   */
  @Get('me')
  @ApiOkResponse({
    description: 'Current user',
    type: UserEntity,
  })
  current(@User() currentUser: UserEntity): UserEntity {
    return new UserEntity(currentUser);
  }

  /**
   * Update current user
   */
  @Patch('me')
  @ApiOkResponse({
    description: 'Updated current user',
    type: UserEntity,
  })
  async updateCurrent(
    @User() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userService.update(currentUser.id, updateUserDto);

    return new UserEntity(user);
  }

  /**
   * Delete current user
   */
  @Delete('me')
  @ApiOkResponse({
    description: 'Deleted current user',
    type: UserEntity,
  })
  async removeCurrent(@User() currentUser: UserEntity): Promise<UserEntity> {
    const user = await this.userService.remove(currentUser.id);

    return new UserEntity(user);
  }

  /**
   * Get all users
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Users',
    type: UserEntity,
    isArray: true,
  })
  async findAll(): Promise<UserEntity[]> {
    const users = await this.userService.findAll();

    return users.map((user) => new UserEntity(user));
  }

  /**
   * Get user
   */
  @Get(':userId')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'User',
    type: UserEntity,
  })
  async findOne(
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<UserEntity> {
    const user = await this.userService.findOne(userId);

    return new UserEntity(user);
  }

  /**
   * Update user
   */
  @Patch(':userId')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Updated user',
    type: UserEntity,
  })
  async update(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userService.update(userId, updateUserDto);

    return new UserEntity(user);
  }

  /**
   * Delete user
   */
  @Delete(':userId')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Deleted user',
    type: UserEntity,
  })
  async remove(
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<UserEntity> {
    const user = await this.userService.remove(userId);

    return new UserEntity(user);
  }
}
