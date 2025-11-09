import got from 'got';
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import metascraperAuthor from 'metascraper-author';
import metascraperLogo from 'metascraper-logo';
import metascraperPublisher from 'metascraper-publisher';
import metascraperUrl from 'metascraper-url';
import metascraperDate from 'metascraper-date';
import metascraperLang from 'metascraper-lang';
import metascraperLogoFavicon from 'metascraper-logo-favicon';

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

export const extractMetadata = async (url: string) => {
  try {
    const { body: html } = await got(url, { timeout: { request: 8000 } });
    const metadata = await scraper({ html, url });
    return metadata;
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    return {}; // fallback if metadata extraction fails
  }
};
