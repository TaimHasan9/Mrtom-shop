import rawCatalog from './othoba-live-catalog.json';
import type { Category } from '../types';

function decodeHtml(str = ''): string {
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const rawCategories = (rawCatalog as { categories: Category[] }).categories;

export const CATEGORIES: Category[] = rawCategories.map((cat) => ({
  ...cat,
  name: decodeHtml(cat.name),
  shortLabel: decodeHtml(cat.shortLabel ?? cat.name),
  subcategories: (cat.subcategories ?? []).map((sub) => ({
    ...sub,
    name: decodeHtml(sub.name),
  })),
}));

export const DIRECTORY_HIGHLIGHTS = CATEGORIES.filter((c) => !c.featuredOnHome).map((c) => ({
  name: c.name,
  href: `/category/${c.slug}`,
}));
