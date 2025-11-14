//  ------------------------------------------------------------------
//  file: src/utils/meta.utils.ts
//  Metadata extraction utilities
//  ------------------------------------------------------------------

import got from 'got';
import metascraper from 'metascraper';
import metascraperAuthor from 'metascraper-author';
import metascraperDate from 'metascraper-date';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import metascraperLang from 'metascraper-lang';
import metascraperLogo from 'metascraper-logo';
import metascraperLogoFavicon from 'metascraper-logo-favicon';
import metascraperPublisher from 'metascraper-publisher';
import metascraperTitle from 'metascraper-title';
import metascraperUrl from 'metascraper-url';

import { BookmarkMetadata } from '../types/bookmark.types';

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperAuthor(),
  metascraperLogo(),
  metascraperPublisher(),
  metascraperUrl(),
  metascraperDate(),
  metascraperLang(),
  metascraperLogoFavicon(),
]);

export const extractMetadata = async (url: string): Promise<BookmarkMetadata> => {
  try {
    const { body: html } = await got(url, { timeout: { request: 8000 } });
    const metadata = await scraper({ html, url });
    return metadata;
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    return {}; // fallback if metadata extraction fails
  }
};
