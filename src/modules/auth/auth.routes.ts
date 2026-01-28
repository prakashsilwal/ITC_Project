import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { signupSchema } from './auth.schemas';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup.bind(authController));

export default router;
