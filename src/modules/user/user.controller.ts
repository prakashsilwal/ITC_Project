import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { UpdateUserRoleInput } from './user.schemas';

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.validatedData as UpdateUserRoleInput;

      const user = await userService.updateUserRole(id, input);

      res.status(200).json({
        success: true,
        data: user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        data: { message: 'User deleted successfully' },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getUserStats();

      res.status(200).json({
        success: true,
        data: stats,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
