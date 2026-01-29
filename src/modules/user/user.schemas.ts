import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be either USER or ADMIN' }),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
