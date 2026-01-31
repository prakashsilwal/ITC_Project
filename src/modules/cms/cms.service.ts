import { galleryRepository, videoRepository } from './cms.repository';
import { CreateGalleryInput, UpdateGalleryInput, CreateVideoInput, UpdateVideoInput } from './cms.schemas';
import { NotFoundError } from '../../utils/errors';
import fs from 'fs/promises';
import path from 'path';

// Gallery service
export const galleryService = {
  async createGallery(data: CreateGalleryInput, uploadedBy: string, files: Express.Multer.File[]) {
    const gallery = await galleryRepository.create(data, uploadedBy);

    if (files && files.length > 0) {
      const images = files.map((file) => ({
        fileName: file.filename,
        filePath: `/uploads/images/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
      }));

      await galleryRepository.addImages(gallery.id, images);
    }

    return galleryRepository.findById(gallery.id);
  },

  async getAllGalleries() {
    return galleryRepository.findAll();
  },

  async getGalleryById(id: string) {
    const gallery = await galleryRepository.findById(id);
    if (!gallery) {
      throw new NotFoundError('Gallery not found');
    }
    return gallery;
  },

  async updateGallery(id: string, data: UpdateGalleryInput, files?: Express.Multer.File[]) {
    const existingGallery = await galleryRepository.findById(id);
    if (!existingGallery) {
      throw new NotFoundError('Gallery not found');
    }

    if (files && files.length > 0) {
      const images = files.map((file) => ({
        fileName: file.filename,
        filePath: `/uploads/images/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
      }));

      await galleryRepository.addImages(id, images);
    }

    return galleryRepository.update(id, data);
  },

  async deleteGallery(id: string) {
    const gallery = await galleryRepository.findById(id);
    if (!gallery) {
      throw new NotFoundError('Gallery not found');
    }

    // Delete image files from disk
    for (const image of gallery.images) {
      const filePath = path.join(process.cwd(), 'uploads', 'images', image.fileName);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
      }
    }

    await galleryRepository.delete(id);
    return { message: 'Gallery deleted successfully' };
  },

  async deleteImage(galleryId: string, imageId: string) {
    const gallery = await galleryRepository.findById(galleryId);
    if (!gallery) {
      throw new NotFoundError('Gallery not found');
    }

    const image = await galleryRepository.findImageById(imageId);
    if (!image || image.galleryId !== galleryId) {
      throw new NotFoundError('Image not found in this gallery');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'images', image.fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }

    await galleryRepository.deleteImage(imageId);
    return { message: 'Image deleted successfully' };
  },
};

// Video service
export const videoService = {
  async createVideo(data: CreateVideoInput, uploadedBy: string) {
    return videoRepository.create(data, uploadedBy);
  },

  async getAllVideos() {
    return videoRepository.findAll();
  },

  async getVideoById(id: string) {
    const video = await videoRepository.findById(id);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    return video;
  },

  async updateVideo(id: string, data: UpdateVideoInput) {
    const existingVideo = await videoRepository.findById(id);
    if (!existingVideo) {
      throw new NotFoundError('Video not found');
    }
    return videoRepository.update(id, data);
  },

  async deleteVideo(id: string) {
    const video = await videoRepository.findById(id);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    await videoRepository.delete(id);
    return { message: 'Video deleted successfully' };
  },
};
