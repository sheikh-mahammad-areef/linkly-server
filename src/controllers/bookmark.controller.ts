// src/controllers/bookmark.controller.ts

import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark.model';
import { BadRequestException, NotFoundException } from '../utils/app-error.utils';
import { HTTP_STATUS_CODE } from '../config/http.config';
import { extractMetadata } from '../utils/meta.utils';

/**
 * @desc Get all bookmarks for authenticated user
 * @route GET /api/bookmarks
 */
export const getBookmarks = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookmarks = await Bookmark.find({ user: user._id });
  res.status(HTTP_STATUS_CODE.OK).json({ bookmarks });
};

/**
 * @desc Get a single bookmark by ID
 * @route GET /api/bookmarks/:id
 */
export const getBookmarkById = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const bookmark = await Bookmark.findOne({ _id: id, user: user._id });
  if (!bookmark) {
    throw new NotFoundException('Bookmark not found');
  }

  res.status(HTTP_STATUS_CODE.OK).json({ bookmark });
};

/**
 * @desc Create a new bookmark
 * @route POST /api/bookmarks
 */
export const createBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, url, description, tags } = req.body;

  // Prevent duplicates for same user + same URL
  const existing = await Bookmark.findOne({ url, user: user._id });
  if (existing) throw new BadRequestException('Bookmark with this URL already exists');

  // 🔍 Fetch metadata
  const metadata = await extractMetadata(url);

  const bookmark = await Bookmark.create({
    title: title || metadata.title || url,
    url,
    description: description || metadata.description,
    tags,
    user: user._id,
    metadata, // store everything (favicon, image, author, etc.)
  });

  res.status(HTTP_STATUS_CODE.CREATED).json({ bookmark });
};

/**
 * @desc Update an existing bookmark
 * @route PUT /api/bookmarks/:id
 */
export const updateBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const updated = await Bookmark.findOneAndUpdate({ _id: id, user: user._id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new NotFoundException('Bookmark not found');

  res.status(HTTP_STATUS_CODE.OK).json({ bookmark: updated });
};

/**
 * @desc Delete a bookmark
 * @route DELETE /api/bookmarks/:id
 */
export const deleteBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const bookmark = await Bookmark.findOne({ _id: id, user: user._id });
  if (!bookmark) {
    throw new NotFoundException('Bookmark not found');
  }

  const deleted = await Bookmark.deleteOne({ _id: id, user: user._id });

  res.status(HTTP_STATUS_CODE.OK).json({ message: 'Bookmark deleted successfully' });
};
