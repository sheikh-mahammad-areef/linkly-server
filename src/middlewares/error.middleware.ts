// src/middleware/error.middleware.ts

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { HTTP_STATUS } from '../config/http.config';
import { log } from 'console';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  console.error(err.stack);
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
