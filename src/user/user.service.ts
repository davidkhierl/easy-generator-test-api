import { BadUserInputException } from '@/common/exceptions/bad-user-input.exception';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create user
   */
  async create(createUserDto: CreateUserDto) {
    const { password, name, email } = createUserDto;

    const password_hash = await argon2.hash(password);

    try {
      return await this.prisma.user.create({
        data: { email, name, password_hash },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadUserInputException([
            {
              property: 'email',
              value: email,
              constraints: { emailAlreadyInUser: 'Email already in use' },
            },
          ]);
        else throw error;
      } else throw new InternalServerErrorException(error);
    }
  }

  /**
   * Find all users
   */
  findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * Find user
   */
  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Find user by email
   */
  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Update user
   */
  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  /**
   * Remove user
   */
  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
