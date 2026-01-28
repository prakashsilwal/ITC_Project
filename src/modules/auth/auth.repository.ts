import { User, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
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

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        country: data.country,
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
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
