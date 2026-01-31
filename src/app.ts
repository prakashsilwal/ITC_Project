import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import cmsRoutes from './modules/cms/cms.routes';
import photoRoutes from './modules/photos/photos.routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { env } from './config/env';

const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export function createApp(): Application {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        }
        if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      },
      customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`;
      },
      customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
      },
    })
  );

  app.use(helmet());

  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? false : '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve static frontend files
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/cms', cmsRoutes);
  app.use('/api/v1/photos', photoRoutes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
