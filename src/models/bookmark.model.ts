// src/models/bookmark.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  user: mongoose.Schema.Types.ObjectId;
  metadata?: {
    description?: string;
    favicon?: string;
    image?: string;
    author?: string;
    og?: Record<string, string>;
  };
  isArchived?: boolean;
  isFavorite?: boolean;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: Schema.Types.Mixed,
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
