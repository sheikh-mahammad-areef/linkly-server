// src/middleware/error.middleware.ts

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, InternalServerException } from '../utils/app-error.utils';
import { HTTP_STATUS_CODE } from '../config/http.config';
import { ERROR_CODE_ENUM } from '../enums/error-code.enum';

export const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  console.error('\n🧨 Error Path:', req.path);
  console.error('🧩 Error Message:', error.message);
  console.error('📜 Stack:', error.stack);

  // Handle malformed JSON
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      message: 'Invalid JSON payload.',
      errorCode: ERROR_CODE_ENUM.JSON_PARSE_ERROR,
    });
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return res.status(error.httpStatusCode).json({
      message: error.message,
      errorCode: error.errorCode,
      details: error.details,
    });
  }

  // Fallback: unexpected errors
  const internal = new InternalServerException();
  return res.status(internal.httpStatusCode).json({
    message: internal.message,
    errorCode: internal.errorCode,
  });
};
