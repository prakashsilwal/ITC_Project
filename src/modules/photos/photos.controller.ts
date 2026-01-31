import { Request, Response, NextFunction } from 'express';
import { photoService } from './photos.service';
import { CreatePhotoInput, UpdatePhotoInput } from './photos.schemas';

export const photoController = {
  async uploadPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'NO_FILES',
            message: 'No files provided for upload',
          },
        });
      }

      // Parse metadata if provided (title and description for each photo)
      let metadata: CreatePhotoInput[] | undefined;
      if (req.body.metadata) {
        try {
          metadata = JSON.parse(req.body.metadata);
        } catch (error) {
          // If metadata parsing fails, ignore and use default values
          metadata = undefined;
        }
      }

      const photos = await photoService.uploadPhotos(userId, files, metadata);

      res.status(201).json({
        success: true,
        data: {
          message: `Successfully uploaded ${files.length} photos`,
          count: files.length,
          photos: photos.slice(0, files.length), // Return only newly uploaded photos
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const photos = await photoService.getAllPhotos();

      res.status(200).json({
        success: true,
        data: photos,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPhotoById(req: Request, res: Response, next: NextFunction) {
    try {
      const photo = await photoService.getPhotoById(req.params.id);

      res.status(200).json({
        success: true,
        data: photo,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const photos = await photoService.getPhotosByUser(userId);

      res.status(200).json({
        success: true,
        data: photos,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePhoto(
    req: Request<{ id: string }, object, UpdatePhotoInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const photo = await photoService.updatePhoto(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: photo,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await photoService.deletePhoto(req.params.id);

      res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMultiplePhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'INVALID_INPUT',
            message: 'ids must be a non-empty array',
          },
        });
      }

      const result = await photoService.deleteMultiplePhotos(ids);

      res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
