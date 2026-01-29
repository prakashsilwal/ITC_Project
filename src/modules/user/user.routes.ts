import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth';
import { requireSuperAdmin, requireAdmin } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateUserRoleSchema } from './user.schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users - ADMIN and SUPER_ADMIN can view
router.get('/', requireAdmin, userController.getAllUsers.bind(userController));

// Get user stats - ADMIN and SUPER_ADMIN can view
router.get('/stats', requireAdmin, userController.getUserStats.bind(userController));

// Get user by ID - ADMIN and SUPER_ADMIN can view
router.get('/:id', requireAdmin, userController.getUserById.bind(userController));

// Update user role - SUPER_ADMIN only
router.patch(
  '/:id/role',
  requireSuperAdmin,
  validate(updateUserRoleSchema),
  userController.updateUserRole.bind(userController)
);

// Delete user - SUPER_ADMIN only
router.delete('/:id', requireSuperAdmin, userController.deleteUser.bind(userController));

export default router;
