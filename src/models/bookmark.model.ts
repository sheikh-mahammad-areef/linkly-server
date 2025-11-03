import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  title: string;
  url: string;
  description?: string;
  tags?: string;
  user: mongoose.Schema.Types.ObjectId;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
