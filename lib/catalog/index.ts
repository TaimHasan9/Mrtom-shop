import rawCatalog from './othoba-live-catalog.json';
import { CATEGORIES, DIRECTORY_HIGHLIGHTS } from './categories';
import { VENDORS as BASE_VENDORS } from './vendors';
import type { Category, Product, Vendor } from '../types';

export { CATEGORIES, DIRECTORY_HIGHLIGHTS };

interface LiveCatalogFile {
  syncedAt: string;
  categories: Category[];
  hotDealSlugs: string[];
  recommendedByTab: Record<string, string[]>;
  products: Product[];
}

const catalogData = rawCatalog as LiveCatalogFile;

function decodeHtml(str = ''): string {
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;|&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;|&#x2013;/gi, '–')
    .replace(/&mdash;|&#x2014;/gi, '—')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

const TRENDING_KEYWORDS = [
  'cargo box',
  'noodles',
  'thermal ice box',
  'dinner',
  'miniket',
  'soyabean',
  'milk powder',
  'water tank',
  'blanket',
  'storage box',
  'rice cooker',
  'geyser',
];

const seenTrendingIds = new Set<string>();
const rawProducts = catalogData.products.map((p) => {
  const tags = Array.isArray(p.tags) ? [...p.tags] : [];
  const lower = p.name.toLowerCase();
  if (
    seenTrendingIds.size < 18 &&
    TRENDING_KEYWORDS.some((kw) => lower.includes(kw))
  ) {
    if (!tags.includes('trending')) tags.push('trending');
    seenTrendingIds.add(p.id);
  }

  return {
    ...p,
    name: decodeHtml(p.name),
    brand: decodeHtml(p.brand),
    categoryName: decodeHtml(p.categoryName),
    subcategoryName: decodeHtml(p.subcategoryName),
    sellerName: decodeHtml(p.sellerName),
    shortDescription: decodeHtml(p.shortDescription),
    description: decodeHtml(p.description),
    tags,
    gallery: p.gallery?.length ? p.gallery : [p.image],
    reviews: p.reviews ?? [],
    questions: p.questions ?? [],
  };
});

// Ensure at least 15 trending products exist
if (rawProducts.filter((p) => p.tags.includes('trending')).length < 15) {
  const sortedBySold = [...rawProducts].sort((a, b) => b.soldCount - a.soldCount);
  for (const item of sortedBySold) {
    if (!item.tags.includes('trending')) {
      item.tags.push('trending');
    }
    if (rawProducts.filter((p) => p.tags.includes('trending')).length >= 15) break;
  }
}

export const ALL_PRODUCTS: Product[] = rawProducts;

const productBySlugMap = new Map<string, Product>();
for (const p of ALL_PRODUCTS) {
  productBySlugMap.set(p.slug.toLowerCase(), p);
  try {
    productBySlugMap.set(decodeURIComponent(p.slug).toLowerCase(), p);
  } catch {
    // ignore malformed URI sequence
  }
}

// Compute live vendor sample images from matched catalog products
function findVendorSampleImages(vendor: Vendor): string[] {
  const nameKey = vendor.name.split(' ')[0].toLowerCase();
  const matched = ALL_PRODUCTS.filter(
    (p) =>
      p.sellerSlug === vendor.slug ||
      p.brand.toLowerCase() === nameKey ||
      p.name.toLowerCase().includes(nameKey)
  );
  if (matched.length >= 3) {
    return matched.slice(0, 3).map((p) => p.image);
  }
  return vendor.sampleImages;
}

export const VENDORS: Vendor[] = BASE_VENDORS.map((v) => ({
  ...v,
  sampleImages: findVendorSampleImages(v),
}));

export const HOT_DEAL_SLUGS: string[] = catalogData.hotDealSlugs ?? [];
export const RECOMMENDED_BY_TAB: Record<string, string[]> = catalogData.recommendedByTab ?? {};

export function getCategoryBySlug(slug: string): Category | undefined {
  const lower = slug.toLowerCase();
  return CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === lower ||
      c.othobaSlug?.toLowerCase() === lower ||
      c.aliases?.some((a) => a.toLowerCase() === lower)
  );
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  const lower = slug.toLowerCase();
  const staticMatch = VENDORS.find((v) => v.slug.toLowerCase() === lower);
  if (staticMatch) return staticMatch;

  // Dynamically build storefront for any of the 1,960 real sellers
  const sellerItems = ALL_PRODUCTS.filter(
    (p) => p.sellerSlug.toLowerCase() === lower || p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') === lower
  );
  if (sellerItems.length === 0) return undefined;

  const first = sellerItems[0];
  return {
    id: `v-${lower}`,
    name: first.sellerName,
    slug: first.sellerSlug,
    rating: 4.8,
    shipOnTime: 98,
    productCount: sellerItems.length,
    verified: true,
    tagline: `Official Mrtom shop Marketplace Storefront · ${first.categoryName}`,
    location: 'Dhaka, Bangladesh',
    logoText: first.brand.toUpperCase().slice(0, 10),
    sampleImages: sellerItems.slice(0, 3).map((p) => p.image),
  };
}

export function getProductBySlug(slug: string): Product | undefined {
  const lower = slug.toLowerCase();
  const direct = productBySlugMap.get(lower);
  if (direct) return direct;

  try {
    const decoded = decodeURIComponent(slug).toLowerCase();
    const byDecoded = productBySlugMap.get(decoded);
    if (byDecoded) return byDecoded;
  } catch {
    // ignore
  }

  // Known friendly aliases for featured hero/campaign links
  if (lower === 'rfl-electric-geyser-glossy-45-liter') {
    return (
      ALL_PRODUCTS.find((p) => p.slug.includes('rfl-electric-geyser-glossy-45-liter')) ??
      ALL_PRODUCTS.find((p) => p.name.toLowerCase().includes('geyser'))
    );
  }
  if (lower === 'philips-na231-1700w-digital-xl-air-fryer') {
    return (
      ALL_PRODUCTS.find((p) => p.name.toLowerCase().includes('philips') && p.name.toLowerCase().includes('air fryer')) ??
      ALL_PRODUCTS.find((p) => p.name.toLowerCase().includes('air fryer'))
    );
  }
  if (lower === 'vision-55-inch-4k-uhd-google-smart-tv') {
    return (
      ALL_PRODUCTS.find((p) => p.name.toLowerCase().includes('vision') && p.name.toLowerCase().includes('tv')) ??
      ALL_PRODUCTS.find((p) => p.categorySlug === 'tv-audio-gaming-wearables')
    );
  }
  if (lower === 'regal-nordic-3-seater-linen-sofa') {
    return ALL_PRODUCTS.find((p) => p.categorySlug === 'furniture');
  }

  // Fallback suffix match (-1 / -2 / -3)
  return ALL_PRODUCTS.find(
    (p) => p.slug.toLowerCase().startsWith(`${lower}-`) || p.id.toLowerCase() === lower
  );
}

export function getRelatedProducts(product: Product, limit = 5): Product[] {
  return ALL_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug
  ).slice(0, limit);
}

export function getAlsoBoughtProducts(
  product: Product,
  excludeIds: string[] = [],
  limit = 5
): Product[] {
  const excluded = new Set([product.id, ...excludeIds]);
  const sameSellerOrFeatured = ALL_PRODUCTS.filter(
    (p) =>
      !excluded.has(p.id) &&
      (p.sellerSlug === product.sellerSlug ||
        p.tags.includes('trending') ||
        p.tags.includes('best-seller'))
  );
  if (sameSellerOrFeatured.length >= limit) {
    return sameSellerOrFeatured.slice(0, limit);
  }
  const rest = ALL_PRODUCTS.filter((p) => !excluded.has(p.id));
  return [...sameSellerOrFeatured, ...rest].slice(0, limit);
}
