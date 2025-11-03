import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(3, 'email must be greater than 3 letters ')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(100, 'Password is too long');

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
});
