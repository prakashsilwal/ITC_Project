import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { SignupInput, LoginInput, COUNTRY_CODES } from './auth.schemas';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.validatedData as SignupInput;

      const user = await authService.signup(input);

      res.status(201).json({
        success: true,
        data: user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.validatedData as LoginInput;

      const user = await authService.login(input);

      res.status(200).json({
        success: true,
        data: user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const user = await authService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCountryCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const countryCodes = Object.entries(COUNTRY_CODES).map(([country, code]) => ({
        country,
        code,
      }));

      res.status(200).json({
        success: true,
        data: countryCodes,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
