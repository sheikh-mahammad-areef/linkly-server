// src/utils/token.utils.ts

import jwt, { JwtPayload } from 'jsonwebtoken';
import { ENV } from '../config/app.config';

export interface TokenPayload extends JwtPayload {
  id: string;
}

// Generate short-lived access token (e.g., 15min)
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, { expiresIn: '10m' });
};

// Generate long-lived refresh token (e.g., 7 days)
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ Verify a token safely
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      return decoded as TokenPayload;
    }
    return null;
  } catch {
    return null;
  }
};

// ✅ Extract token from "Authorization" header
export const extractBearerToken = (header?: string): string | null => {
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];
  return typeof token === 'string' ? token : null;
};
