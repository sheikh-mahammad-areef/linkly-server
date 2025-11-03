import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark.model';

export const getBookmarks = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookmarks = await Bookmark.find({ user: user._id });
  res.json({ bookmarks });
};

export const getBookmarkById = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookmark = await Bookmark.findOne({ _id: req.params.id, user: user._id });
  if (!bookmark) return res.status(404).json({ message: 'Not found' });
  res.json({ bookmark });
};

export const createBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, url, description, tags } = req.body;
  const bookmark = await Bookmark.create({ title, url, description, tags, user: user._id });
  res.status(201).json({ bookmark });
};

export const updateBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const update = await Bookmark.findOneAndUpdate({ _id: id, user: user._id }, req.body, {
    new: true,
  });
  if (!update) return res.status(404).json({ message: 'Bookmark not found' });
  res.json({ bookmark: update });
};

export const deleteBookmark = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const deleted = await Bookmark.findOneAndDelete({ _id: id, user: user._id });
  if (!deleted) return res.status(404).json({ message: 'Bookmark not found' });
  res.json({ message: 'Bookmark deleted' });
};
