import { User as PrismaUser } from '@prisma/client';

export {};

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends Omit<PrismaUser, 'password_hash'> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Request {}
  }
}
