import { z } from 'zod';

// Gallery schemas
export const createGallerySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
});

export const updateGallerySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

// Video schemas
export const createVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  youtubeUrl: z.string().url('Invalid YouTube URL').regex(
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    'Must be a valid YouTube URL'
  ),
  thumbnailUrl: z.string().url().optional(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  youtubeUrl: z.string().url().regex(
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    'Must be a valid YouTube URL'
  ).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
