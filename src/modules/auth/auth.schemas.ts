import { z } from 'zod';

export const signupSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format')
    .min(1, 'Email cannot be empty')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(12, 'Password must be at least 12 characters long')
    .max(128, 'Password is too long'),
});

export type SignupInput = z.infer<typeof signupSchema>;
