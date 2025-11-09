//  src/middleware/asyncHandler.middleware.ts
//  since we are using the express framework >5 which has built-in async error handling, this middleware is optional

import { Request, Response, NextFunction } from 'express';

type AsyncControllerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =
  (controller: AsyncControllerType) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
