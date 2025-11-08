// src/routes/auth.routes.ts

import { Router } from 'express';
import { login, refresh, register } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, refreshSchema, registerSchema } from '../validations/auth.validation';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);

export default router;
