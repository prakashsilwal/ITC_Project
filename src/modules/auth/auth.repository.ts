import { User, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role ?? UserRole.USER,
      },
    });
  }

  async userExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
    return count > 0;
  }
}

export const authRepository = new AuthRepository();
