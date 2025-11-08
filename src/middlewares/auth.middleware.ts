// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { extractBearerToken, verifyToken } from '../utils/token.utils';
import { HTTP_STATUS } from '../config/http.config';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = extractBearerToken(req.headers.authorization);
    if (!accessToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: 'Invalid or expired access token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not found' });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Authentication failed' });
  }
};
