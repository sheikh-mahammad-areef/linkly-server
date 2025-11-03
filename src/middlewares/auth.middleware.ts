import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/app.config';
import { User } from '../models/user.model';
import { extractBearerToken, verifyToken } from '../utils/token.utils';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  req.user = user; // ✅ thanks to your global declaration
  next();
};
