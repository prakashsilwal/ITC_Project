import { Request, Response, NextFunction } from 'express';
import { galleryService, videoService } from './cms.service';
import { CreateGalleryInput, UpdateGalleryInput, CreateVideoInput, UpdateVideoInput } from './cms.schemas';

// Gallery controllers
export const galleryController = {
  async createGallery(
    req: Request<object, object, CreateGalleryInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      const gallery = await galleryService.createGallery(req.body, userId, files);

      res.status(201).json({
        success: true,
        data: gallery,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllGalleries(req: Request, res: Response, next: NextFunction) {
    try {
      const galleries = await galleryService.getAllGalleries();

      res.status(200).json({
        success: true,
        data: galleries,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGalleryById(req: Request, res: Response, next: NextFunction) {
    try {
      const gallery = await galleryService.getGalleryById(req.params.id);

      res.status(200).json({
        success: true,
        data: gallery,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateGallery(
    req: Request<{ id: string }, object, UpdateGalleryInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const files = req.files as Express.Multer.File[];
      const gallery = await galleryService.updateGallery(req.params.id, req.body, files);

      res.status(200).json({
        success: true,
        data: gallery,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await galleryService.deleteGallery(req.params.id);

      res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { galleryId, imageId } = req.params;
      const result = await galleryService.deleteImage(galleryId, imageId);

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

// Video controllers
export const videoController = {
  async createVideo(
    req: Request<object, object, CreateVideoInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.userId;
      const video = await videoService.createVideo(req.body, userId);

      res.status(201).json({
        success: true,
        data: video,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await videoService.getAllVideos();

      res.status(200).json({
        success: true,
        data: videos,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getVideoById(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.getVideoById(req.params.id);

      res.status(200).json({
        success: true,
        data: video,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateVideo(
    req: Request<{ id: string }, object, UpdateVideoInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const video = await videoService.updateVideo(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: video,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await videoService.deleteVideo(req.params.id);

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
