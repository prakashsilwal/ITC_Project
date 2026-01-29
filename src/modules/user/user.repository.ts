import { User, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async countByRole(role: UserRole): Promise<number> {
    return prisma.user.count({
      where: { role },
    });
  }
}

export const userRepository = new UserRepository();
