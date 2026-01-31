import { PrismaClient } from '@prisma/client';
import { CreateGalleryInput, UpdateGalleryInput, CreateVideoInput, UpdateVideoInput } from './cms.schemas';

const prisma = new PrismaClient();

// Gallery repository
export const galleryRepository = {
  async create(data: CreateGalleryInput, uploadedBy: string) {
    return prisma.gallery.create({
      data: {
        title: data.title,
        description: data.description,
        uploadedBy,
      },
      include: {
        images: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async addImages(
    galleryId: string,
    images: Array<{ fileName: string; filePath: string; fileSize: number; mimeType: string }>
  ) {
    return prisma.image.createMany({
      data: images.map((img) => ({
        ...img,
        galleryId,
      })),
    });
  },

  async findAll() {
    return prisma.gallery.findMany({
      include: {
        images: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async findById(id: string) {
    return prisma.gallery.findUnique({
      where: { id },
      include: {
        images: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async update(id: string, data: UpdateGalleryInput) {
    return prisma.gallery.update({
      where: { id },
      data,
      include: {
        images: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.gallery.delete({
      where: { id },
    });
  },

  async deleteImage(imageId: string) {
    return prisma.image.delete({
      where: { id: imageId },
    });
  },

  async findImageById(imageId: string) {
    return prisma.image.findUnique({
      where: { id: imageId },
    });
  },
};

// Video repository
export const videoRepository = {
  async create(data: CreateVideoInput, uploadedBy: string) {
    return prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        youtubeUrl: data.youtubeUrl,
        thumbnailUrl: data.thumbnailUrl,
        uploadedBy,
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.video.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async findById(id: string) {
    return prisma.video.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async update(id: string, data: UpdateVideoInput) {
    return prisma.video.update({
      where: { id },
      data,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.video.delete({
      where: { id },
    });
  },
};
