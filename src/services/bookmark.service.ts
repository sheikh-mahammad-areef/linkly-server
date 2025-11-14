//  ---------------------------------------------------------------------------
// FILE: src/services/bookmark.service.ts
// Business logic for bookmarks
// ---------------------------------------------------------------------------

import { FilterQuery } from 'mongoose';

import { Bookmark, IBookmark } from '../models/bookmark.model';
import { CreateBookmarkBody, UpdateBookmarkBody } from '../types/bookmark.types';
import { BadRequestException, NotFoundException } from '../utils/app-error.utils';
import { extractMetadata } from '../utils/meta.utils';

class BookmarkService {
  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(userId: string): Promise<IBookmark[]> {
    return Bookmark.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Get a single bookmark by ID and user
   */
  async getBookmarkById(bookmarkId: string, userId: string): Promise<IBookmark> {
    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  /**
   * Check if bookmark with URL already exists for user
   */
  async checkDuplicateUrl(url: string, userId: string): Promise<boolean> {
    const existing = await Bookmark.findOne({ url, user: userId });
    return !!existing;
  }

  /**
   * Create a new bookmark
   */
  async createBookmark(userId: string, data: CreateBookmarkBody): Promise<IBookmark> {
    const { title, url, description, tags } = data;

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateUrl(url, userId);
    if (isDuplicate) {
      throw new BadRequestException('Bookmark with this URL already exists');
    }

    // Fetch metadata
    // 🔍 Fetch metadata
    const metadata = await extractMetadata(url);

    // Create bookmark with metadata fallbacks
    const bookmark = await Bookmark.create({
      title: title ?? metadata.title ?? url,
      url,
      description: description ?? metadata.description ?? '',
      tags: tags ?? [],
      user: userId,
      metadata,
    });

    return bookmark;
  }

  /**
   * Update an existing bookmark
   */
  async updateBookmark(
    bookmarkId: string,
    userId: string,
    data: UpdateBookmarkBody,
  ): Promise<IBookmark> {
    // Build update object with only provided fields
    const updateData: Partial<IBookmark> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const updated = await Bookmark.findOneAndUpdate({ _id: bookmarkId, user: userId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundException('Bookmark not found');
    }

    return updated;
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(bookmarkId: string, userId: string): Promise<void> {
    const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await Bookmark.deleteOne({ _id: bookmarkId, user: userId });
  }

  /**
   * Search bookmarks by query
   */
  async searchBookmarks(userId: string, query: string): Promise<IBookmark[]> {
    const filter: FilterQuery<IBookmark> = {
      user: userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { url: { $regex: query, $options: 'i' } },
      ],
    };

    return Bookmark.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Get bookmarks by tag
   */
  async getBookmarksByTag(userId: string, tag: string): Promise<IBookmark[]> {
    return Bookmark.find({ user: userId, tags: tag }).sort({ createdAt: -1 });
  }

  /**
   * Get bookmarks with pagination
   */
  async getPaginatedBookmarks(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ bookmarks: IBookmark[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bookmark.countDocuments({ user: userId }),
    ]);

    return {
      bookmarks,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();
