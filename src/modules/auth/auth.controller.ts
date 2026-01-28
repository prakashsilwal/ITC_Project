import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { SignupInput } from './auth.schemas';

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
}

export const authController = new AuthController();
