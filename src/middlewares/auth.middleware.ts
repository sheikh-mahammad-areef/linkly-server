//  ------------------------------------------------------------------
//  file: src/middlewares/auth.middleware.ts
//  Authentication middleware
//  ------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';

import { User } from '../models/user.model';
import { UnauthorizedException } from '../utils/app-error.utils';
import { extractBearerToken, verifyToken } from '../utils/token.utils';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = extractBearerToken(req.headers.authorization);
  if (!accessToken) {
    throw new UnauthorizedException('No token provided');
  }

  const decoded = verifyToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedException('Invalid or expired access token');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // Attach authenticated user to request
  req.user = user;
  next();
};
