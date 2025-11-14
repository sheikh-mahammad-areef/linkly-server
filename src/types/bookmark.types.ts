//  ------------------------------------------------------------------
//  file: src/types/bookmark.types.ts
//  Types related to bookmark operations
//  ------------------------------------------------------------------

/**
 * Route parameters for bookmark operations
 */
export interface BookmarkParams {
  id: string;
}

/**
 * Request body for creating a bookmark
 */
export interface CreateBookmarkBody {
  title?: string;
  url: string;
  description?: string;
  tags?: string[];
}

/**
 * Request body for updating a bookmark
 */
export interface UpdateBookmarkBody {
  title?: string;
  url?: string;
  description?: string;
  tags?: string[];
}

/**
 * Query parameters for filtering bookmarks
 */
export interface BookmarkQuery {
  tag?: string;
  search?: string;
  limit?: string;
  page?: string;
}

/**
 * Metadata extracted from URL
 */
export interface BookmarkMetadata {
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
  author?: string;
  siteName?: string;
  og?: Record<string, string>;
}
