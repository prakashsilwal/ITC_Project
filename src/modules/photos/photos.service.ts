import { photoRepository } from './photos.repository';
import { CreatePhotoInput, UpdatePhotoInput } from './photos.schemas';
import { NotFoundError } from '../../utils/errors';
import fs from 'fs/promises';
import path from 'path';

export const photoService = {
  async uploadPhotos(uploadedBy: string, files: Express.Multer.File[], metadata?: CreatePhotoInput[]) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const photos = files.map((file, index) => ({
      title: metadata?.[index]?.title || file.originalname,
      description: metadata?.[index]?.description,
      fileName: file.filename,
      filePath: `/uploads/images/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
    }));

    await photoRepository.createMany(photos);

    // Return the created photos
    return photoRepository.findByUploader(uploadedBy);
  },

  async getAllPhotos() {
    return photoRepository.findAll();
  },

  async getPhotoById(id: string) {
    const photo = await photoRepository.findById(id);
    if (!photo) {
      throw new NotFoundError('Photo not found');
    }
    return photo;
  },

  async getPhotosByUser(userId: string) {
    return photoRepository.findByUploader(userId);
  },

  async updatePhoto(id: string, data: UpdatePhotoInput) {
    const existingPhoto = await photoRepository.findById(id);
    if (!existingPhoto) {
      throw new NotFoundError('Photo not found');
    }
    return photoRepository.update(id, data);
  },

  async deletePhoto(id: string) {
    const photo = await photoRepository.findById(id);
    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', 'images', photo.fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }

    await photoRepository.delete(id);
    return { message: 'Photo deleted successfully' };
  },

  async deleteMultiplePhotos(ids: string[]) {
    const deletedPhotos = [];
    for (const id of ids) {
      try {
        await this.deletePhoto(id);
        deletedPhotos.push(id);
      } catch (error) {
        console.error(`Failed to delete photo ${id}:`, error);
      }
    }
    return { message: `Successfully deleted ${deletedPhotos.length} photos`, deletedPhotos };
  },
};
