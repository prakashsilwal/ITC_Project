import { Router } from 'express';
import { photoController } from './photos.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploadImages } from '../../middleware/upload';
import { updatePhotoSchema } from './photos.schemas';

const router = Router();

// Upload multiple photos at once
router.post(
  '/',
  authenticate,
  uploadImages,
  photoController.uploadPhotos
);

// Get all photos
router.get('/', photoController.getAllPhotos);

// Get current user's photos
router.get('/my-photos', authenticate, photoController.getMyPhotos);

// Get single photo by ID
router.get('/:id', photoController.getPhotoById);

// Update photo (title/description only)
router.put(
  '/:id',
  authenticate,
  validate(updatePhotoSchema),
  photoController.updatePhoto
);

// Delete single photo
router.delete('/:id', authenticate, photoController.deletePhoto);

// Delete multiple photos
router.post('/delete-multiple', authenticate, photoController.deleteMultiplePhotos);

export default router;
