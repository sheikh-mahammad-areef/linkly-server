import { z } from 'zod';

// Schema for creating a bookmark
export const createBookmarkSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required'),
      url: z.string().url('Invalid URL'),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .strict(),
});

// Schema for updating a bookmark
export const updateBookmarkSchema = z.object({
  body: z
    .object({
      title: z.string().optional(),
      url: z.string().url().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .strict(),
  params: z.object({
    id: z.string().min(1, 'Bookmark ID required'),
  }),
});

// Schema for validating bookmark ID in params only
export const bookmarkIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Bookmark ID required'),
  }),
});
