import { UserRole } from '@prisma/client';
import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { ConflictError, ValidationError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { SignupInput, LoginInput } from './auth.schemas';
import { signToken } from '../../utils/jwt';
import pino from 'pino';

const logger = pino({ name: 'auth-service' });

export interface SignupResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
  role: UserRole;
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    countryCode: string;
    phoneNumber: string;
    role: UserRole;
  };
  token: string;
}

export class AuthService {
  async signup(input: SignupInput): Promise<SignupResponse> {
    const { email, password, firstName, lastName, country, countryCode, phoneNumber } = input;

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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      country: country.trim(),
      countryCode,
      phoneNumber,
      role: UserRole.USER,
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      logger.warn({ email: normalizedEmail }, 'Login attempt with non-existent email');
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn({ email: normalizedEmail, userId: user.id }, 'Login attempt with invalid password');
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token,
    };
  }

  async getUserProfile(userId: string): Promise<SignupResponse> {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      logger.warn({ userId }, 'User not found');
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
    };
  }
}

export const authService = new AuthService();
