import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { signupSchema, loginSchema } from './auth.schemas';

const router = Router();

router.get('/country-codes', authController.getCountryCodes.bind(authController));
router.post('/signup', validate(signupSchema), authController.signup.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
