import { UserRole } from '@prisma/client';
import { userRepository } from './user.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';
import { UpdateUserRoleInput } from './user.schemas';
import pino from 'pino';

const logger = pino({ name: 'user-service' });

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserRole(userId: string, input: UpdateUserRoleInput): Promise<UserResponse> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Prevent changing SUPER_ADMIN role
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot change SUPER_ADMIN role', 'SUPER_ADMIN_ROLE_PROTECTED');
    }

    // Convert string enum to UserRole enum
    const newRole = UserRole[input.role as keyof typeof UserRole];

    // Validate role transition
    if (user.role === newRole) {
      throw new ValidationError(`User is already a ${newRole}`, 'ROLE_UNCHANGED');
    }

    const updatedUser = await userRepository.updateUserRole(userId, newRole);

    logger.info(
      { userId: updatedUser.id, oldRole: user.role, newRole },
      'User role updated'
    );

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      country: updatedUser.country,
      countryCode: updatedUser.countryCode,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Prevent deleting SUPER_ADMIN
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot delete SUPER_ADMIN user', 'SUPER_ADMIN_DELETE_PROTECTED');
    }

    await userRepository.deleteUser(userId);

    logger.info({ userId, email: user.email, role: user.role }, 'User deleted');
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalRegularUsers: number;
    totalSuperAdmins: number;
  }> {
    const [totalAdmins, totalRegularUsers, totalSuperAdmins] = await Promise.all([
      userRepository.countByRole(UserRole.ADMIN),
      userRepository.countByRole(UserRole.USER),
      userRepository.countByRole(UserRole.SUPER_ADMIN),
    ]);

    const totalUsers = totalAdmins + totalRegularUsers + totalSuperAdmins;

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      totalSuperAdmins,
    };
  }
}

export const userService = new UserService();
