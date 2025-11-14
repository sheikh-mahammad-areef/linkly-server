// ============================================================================
// FILE: src/controllers/bookmark.controller.ts
// bookmarks Controller logic
// ============================================================================

import { Request, Response } from 'express';

import { HTTP_STATUS_CODE } from '../config/http.config';
import { bookmarkService } from '../services/bookmark.service';
import { CreateBookmarkBody, UpdateBookmarkBody } from '../types/bookmark.types';
import { BadRequestException } from '../utils/app-error.utils';

/**
 * @desc Get all bookmarks for authenticated user
 * @route GET /api/bookmarks
 */
export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const bookmarks = await bookmarkService.getUserBookmarks(userId);
  res.status(HTTP_STATUS_CODE.OK).json({ bookmarks });
};

/**
 * @desc Get a single bookmark by ID
 * @route GET /api/bookmarks/:id
 */
export const getBookmarkById = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const { id } = req.params;
  if (!id) {
    throw new BadRequestException('Id parameter is required');
  }
  const bookmark = await bookmarkService.getBookmarkById(id, userId);
  res.status(HTTP_STATUS_CODE.OK).json({ bookmark });
};

/**
 * @desc Create a new bookmark
 * @route POST /api/bookmarks
 */
export const createBookmark = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const bookmark = await bookmarkService.createBookmark(userId, req.body as CreateBookmarkBody);
  res.status(HTTP_STATUS_CODE.CREATED).json({ bookmark });
};

/**
 * @desc Update an existing bookmark
 * @route PUT /api/bookmarks/:id
 */
export const updateBookmark = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const { id } = req.params;
  if (!id) {
    throw new BadRequestException('id parameter is required');
  }
  const bookmark = await bookmarkService.updateBookmark(id, userId, req.body as UpdateBookmarkBody);
  res.status(HTTP_STATUS_CODE.OK).json({ bookmark });
};

/**
 * @desc Delete a bookmark
 * @route DELETE /api/bookmarks/:id
 */
export const deleteBookmark = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const { id } = req.params;
  if (!id) {
    throw new BadRequestException('id parameter is required');
  }
  await bookmarkService.deleteBookmark(id, userId);
  res.status(HTTP_STATUS_CODE.OK).json({ message: 'Bookmark deleted successfully' });
};

/**
 * @desc Search bookmarks
 * @route GET /api/bookmarks/search?q=query
 */
export const searchBookmarks = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const query = (req.query.q ?? '') as string;
  const bookmarks = await bookmarkService.searchBookmarks(userId, query);
  res.status(HTTP_STATUS_CODE.OK).json({ bookmarks });
};

/**
 * @desc Get bookmarks by tag
 * @route GET /api/bookmarks/tags/:tag
 */
export const getBookmarksByTag = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.user._id);
  const { tag } = req.params;
  if (!tag) {
    throw new BadRequestException('Tag parameter is required');
  }
  const bookmarks = await bookmarkService.getBookmarksByTag(userId, tag);
  res.status(HTTP_STATUS_CODE.OK).json({ bookmarks });
};
