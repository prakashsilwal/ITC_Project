import { UserRole } from '@prisma/client';
import { authRepository } from './auth.repository';
import { hashPassword } from '../../utils/password';
import { ConflictError, ValidationError } from '../../utils/errors';
import { SignupInput } from './auth.schemas';
import pino from 'pino';

const logger = pino({ name: 'auth-service' });

export interface SignupResponse {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  async signup(input: SignupInput): Promise<SignupResponse> {
    const { email, password } = input;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await authRepository.userExists(normalizedEmail);
    if (existingUser) {
      logger.warn({ email: normalizedEmail }, 'Signup attempt with existing email');
      throw new ConflictError('Email already registered', 'EMAIL_ALREADY_EXISTS');
    }

    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn({ error: error.message }, 'Password validation failed');
        throw new ValidationError(error.message, 'INVALID_PASSWORD');
      }
      throw error;
    }

    const user = await authRepository.createUser({
      email: normalizedEmail,
      passwordHash,
      role: UserRole.USER,
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
