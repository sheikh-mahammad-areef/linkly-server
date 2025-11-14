//  ------------------------------------------------------------------
//  file: src/middlewares/validate.middleware.ts
//  Validation middleware using Zod
//  ------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

import { ERROR_CODE_ENUM } from '../enums/error-code.enum';
import { BadRequestException } from '../utils/app-error.utils';

/**
 * Validates request body, query, and params using a Zod schema.
 * On failure, throws a structured BadRequestException that
 * the global error handler will catch and format consistently.
 */
export const validate =
  (schema: ZodType) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body as undefined,
        query: req.query,
        params: req.params,
      });
      next();
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        // Forward the structured error to global handler
        next(
          new BadRequestException('Validation failed', ERROR_CODE_ENUM.VALIDATION_ERROR, details),
        );
        return;
      }

      // Fallback for unexpected errors
      next(new BadRequestException('Invalid request format', ERROR_CODE_ENUM.VALIDATION_ERROR));
      return;
    }
  };
