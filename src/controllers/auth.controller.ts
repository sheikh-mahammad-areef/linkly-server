// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.utils';
import { HTTP_STATUS_CODE } from '../config/http.config';
import { ERROR_CODE_ENUM } from '../enums/error-code.enum';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerException,
} from '../utils/app-error.utils';

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

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

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

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

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
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

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    throw new BadRequestException(
      'No refresh token provided',
      ERROR_CODE_ENUM.AUTH_REFRESH_TOKEN_NOT_FOUND,
    );

  await RefreshToken.deleteOne({ token: refreshToken });
  res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logged out successfully' });
};

// PROFILE
export const getProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedException('Unauthorized', ERROR_CODE_ENUM.AUTH_UNAUTHORIZED);

  res.status(HTTP_STATUS_CODE.OK).json({ user });
};
