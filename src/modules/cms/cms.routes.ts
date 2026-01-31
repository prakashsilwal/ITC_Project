import { Router } from 'express';
import { galleryController, videoController } from './cms.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploadImages } from '../../middleware/upload';
import {
  createGallerySchema,
  updateGallerySchema,
  createVideoSchema,
  updateVideoSchema,
} from './cms.schemas';

const router = Router();

// Gallery routes
router.post(
  '/galleries',
  authenticate,
  uploadImages,
  validate(createGallerySchema),
  galleryController.createGallery
);

router.get('/galleries', galleryController.getAllGalleries);

router.get('/galleries/:id', galleryController.getGalleryById);

router.put(
  '/galleries/:id',
  authenticate,
  uploadImages,
  validate(updateGallerySchema),
  galleryController.updateGallery
);

router.delete('/galleries/:id', authenticate, galleryController.deleteGallery);

router.delete(
  '/galleries/:galleryId/images/:imageId',
  authenticate,
  galleryController.deleteImage
);

// Video routes
router.post(
  '/videos',
  authenticate,
  validate(createVideoSchema),
  videoController.createVideo
);

router.get('/videos', videoController.getAllVideos);

router.get('/videos/:id', videoController.getVideoById);

router.put(
  '/videos/:id',
  authenticate,
  validate(updateVideoSchema),
  videoController.updateVideo
);

router.delete('/videos/:id', authenticate, videoController.deleteVideo);

export default router;
