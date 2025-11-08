// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.utils';
import { RefreshToken } from '../models/refreshToken.model';

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      user: { id: user._id, name, email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      user: { id: user._id, name: user.name, email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response) => {
  try {
    console.log('Refresh token request body:');
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(403).json({ message: 'Invalid refresh token' });

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(403).json({ message: 'Expired or invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(decoded.id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });

    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
};
