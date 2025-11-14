//  ------------------------------------------------------------------
//  file: src/middlewares/error.middleware.ts
//  Error handling middleware
//  ------------------------------------------------------------------

import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';

import { HTTP_STATUS_CODE } from '../config/http.config';
import { ERROR_CODE_ENUM } from '../enums/error-code.enum';
import { AppError, InternalServerException } from '../utils/app-error.utils';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('\n🧨 Error Path:', req.path);
  if (error instanceof Error) {
    console.error('🧩 Error Message:', error.message);
    console.error('📜 Stack:', error.stack);
  }

  // Handle malformed JSON
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      success: false,
      message: 'Invalid JSON payload.',
      errorCode: ERROR_CODE_ENUM.JSON_PARSE_ERROR,
    });
    return;
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    res.status(error.httpStatusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      details: error.details,
    });
    return;
  }

  // Fallback: unexpected errors
  const internal = new InternalServerException();
  res.status(internal.httpStatusCode).json({
    success: false,
    message: internal.message,
    errorCode: internal.errorCode,
  });
};
