import { z } from 'zod';

// Photo schemas
export const createPhotoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
});

export const updatePhotoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
