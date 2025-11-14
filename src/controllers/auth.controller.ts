// ============================================================================
// FILE: src/controllers/auth.controller.ts
// Authentication Controller logic
// ============================================================================

import { Request, Response } from 'express';

import { HTTP_STATUS_CODE } from '../config/http.config';
import { ERROR_CODE_ENUM } from '../enums/error-code.enum';
import { RefreshToken } from '../models/refreshToken.model';
import { User } from '../models/user.model';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '../utils/app-error.utils';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.utils';

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const exists = await User.findOne({ email });
  if (exists)
    throw new BadRequestException(
      'Email already in use',
      ERROR_CODE_ENUM.AUTH_EMAIL_ALREADY_EXISTS,
    );

  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  // Before creating a new refresh token, delete any existing ones
  await RefreshToken.deleteMany({ userId: user._id });

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(HTTP_STATUS_CODE.CREATED).json({
    user: { id: user._id, name, email },
    accessToken,
    refreshToken,
  });
};

/**
 * @desc Login user and return tokens
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundException('User not found', ERROR_CODE_ENUM.AUTH_USER_NOT_FOUND);

  const valid = await user.comparePassword(password);
  if (!valid)
    throw new UnauthorizedException(
      'Invalid credentials',
      ERROR_CODE_ENUM.AUTH_INVALID_CREDENTIALS,
    );

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  // Before creating a new refresh token, delete any existing ones
  await RefreshToken.deleteMany({ userId: user._id });

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(HTTP_STATUS_CODE.OK).json({
    user: { id: user._id, name: user.name, email },
    accessToken,
    refreshToken,
  });
};

/**
 * @desc Generate new access token from refresh token
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken)
    throw new BadRequestException(
      'No refresh token provided',
      ERROR_CODE_ENUM.AUTH_REFRESH_TOKEN_NOT_FOUND,
    );

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored)
    throw new UnauthorizedException('Invalid refresh token', ERROR_CODE_ENUM.AUTH_INVALID_TOKEN);

  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    await RefreshToken.deleteOne({ token: refreshToken });
    throw new UnauthorizedException(
      'Expired or invalid refresh token',
      ERROR_CODE_ENUM.AUTH_EXPIRED_TOKEN,
    );
  }

  const newAccessToken = generateAccessToken(decoded.id);
  res.status(HTTP_STATUS_CODE.OK).json({ accessToken: newAccessToken });
};

/**
 * @desc Logout user by invalidating refresh token
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken)
    throw new BadRequestException(
      'No refresh token provided',
      ERROR_CODE_ENUM.AUTH_REFRESH_TOKEN_NOT_FOUND,
    );

  await RefreshToken.deleteOne({ token: refreshToken });
  res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logged out successfully' });
};

/**
 * @desc Get authenticated user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = (req: Request, res: Response): void => {
  const user = req.user;
  // if (!user) throw new UnauthorizedException('Unauthorized', ERROR_CODE_ENUM.AUTH_UNAUTHORIZED);

  res.status(HTTP_STATUS_CODE.OK).json({ user });
};
