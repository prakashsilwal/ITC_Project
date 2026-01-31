import { PrismaClient } from '@prisma/client';
import { CreatePhotoInput, UpdatePhotoInput } from './photos.schemas';

const prisma = new PrismaClient();

export const photoRepository = {
  async create(
    data: CreatePhotoInput,
    uploadedBy: string,
    fileData: { fileName: string; filePath: string; fileSize: number; mimeType: string }
  ) {
    return prisma.photo.create({
      data: {
        title: data.title,
        description: data.description,
        fileName: fileData.fileName,
        filePath: fileData.filePath,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
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

  async createMany(
    photos: Array<{
      title: string;
      description?: string;
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      uploadedBy: string;
    }>
  ) {
    return prisma.photo.createMany({
      data: photos,
    });
  },

  async findAll() {
    return prisma.photo.findMany({
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
    return prisma.photo.findUnique({
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

  async findByUploader(uploadedBy: string) {
    return prisma.photo.findMany({
      where: { uploadedBy },
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

  async update(id: string, data: UpdatePhotoInput) {
    return prisma.photo.update({
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
    return prisma.photo.delete({
      where: { id },
    });
  },
};
