//  ------------------------------------------------------------------
//  file: src/routes/auth.routes.ts
//  Authentication routes
//  ------------------------------------------------------------------

import { Router } from 'express';

import { getProfile, login, logout, refresh, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from '../validations/auth.validation';
const router = Router();

// @route   POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// @route   POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// @route   POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), refresh);

// @route   POST /api/auth/logout
router.post('/logout', validate(logoutSchema), logout);

// @route   GET /api/auth/profile
router.get('/profile', authMiddleware, getProfile);

export default router;
