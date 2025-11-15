//  ------------------------------------------------------------------
//  file: src/app.ts
//  Main application setup
//  ------------------------------------------------------------------

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { ENV } from './config/app.config';
import { HTTP_STATUS_CODE } from './config/http.config';
import { ERROR_CODE_ENUM } from './enums/error-code.enum';
import { errorHandler } from './middlewares/error.middleware';
import routes from './router';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api', routes);

// 404 handler - must be BEFORE error handler
app.use((req, res) => {
  res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errorCode: ERROR_CODE_ENUM.NOT_FOUND,
  });
});

// Error handler
app.use(errorHandler);

const test;

export default app;
