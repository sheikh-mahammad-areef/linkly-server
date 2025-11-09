// src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { BadRequestException } from '../utils/app-error.utils';
import { ERROR_CODE_ENUM } from '../enums/error-code.enum';

/**
 * Validates request body, query, and params using a Zod schema.
 * On failure, throws a structured BadRequestException that
 * the global error handler will catch and format consistently.
 */
export const validate =
  (schema: ZodType<any>) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        // Forward the structured error to global handler
        return next(
          new BadRequestException('Validation failed', ERROR_CODE_ENUM.VALIDATION_ERROR, details),
        );
      }

      // Fallback for unexpected errors
      return next(
        new BadRequestException('Invalid request format', ERROR_CODE_ENUM.VALIDATION_ERROR),
      );
    }
  };
