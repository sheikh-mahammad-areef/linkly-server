//  ------------------------------------------------------------------
//  file: src/routes/bookmark.routes.ts
//  Bookmark management routes
//  ------------------------------------------------------------------

import { Router } from 'express';

import {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmark.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkIdSchema,
} from '../validations/bookmark.validation';

const router = Router();

// @route   GET /api/bookmarks
router.get('/', authMiddleware, getBookmarks);

// @route   GET /api/bookmarks/:id
router.get('/:id', authMiddleware, validate(bookmarkIdSchema), getBookmarkById);

// @route   POST /api/bookmarks
router.post('/', authMiddleware, validate(createBookmarkSchema), createBookmark);

// @route   PUT /api/bookmarks/:id
router.put('/:id', authMiddleware, validate(updateBookmarkSchema), updateBookmark);

// @route   DELETE /api/bookmarks/:id
router.delete('/:id', authMiddleware, validate(bookmarkIdSchema), deleteBookmark);

export default router;
