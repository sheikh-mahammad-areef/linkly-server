// ============================================================================
// FILE: src/controllers/auth.controller.ts
// Authentication Controller logic
// ============================================================================

import { Request, Response } from 'express';

import { HTTP_STATUS_CODE } from '../config/http.config';
import { authService } from '../services/auth.service';

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const result = await authService.register({ name, email, password });
  res.status(HTTP_STATUS_CODE.CREATED).json(result);
};

/**
 * @desc Login user and return tokens
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login({ email, password });
  res.status(HTTP_STATUS_CODE.OK).json(result);
};

/**
 * @desc Generate new access token from refresh token
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(HTTP_STATUS_CODE.OK).json(result);
};

/**
 * @desc Logout user by invalidating refresh token
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken: string };
  await authService.logout(refreshToken);
  res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logged out successfully' });
};

/**
 * @desc Get authenticated user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const profile = await authService.getProfile(userId);
  res.status(HTTP_STATUS_CODE.OK).json({ user: profile });
};
