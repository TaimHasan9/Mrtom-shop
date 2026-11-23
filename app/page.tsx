import HomeClient from '@/components/HomeClient';
import {
  CATEGORIES,
  HOT_DEAL_SLUGS,
  RECOMMENDED_BY_TAB,
  VENDORS,
} from '@/lib/catalog';
import { getEnrichedProducts } from '@/lib/server-store';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const all = getEnrichedProducts();
  const bySlug = new Map(all.map((p) => [p.slug.toLowerCase(), p]));

  const resolveBySlugs = (slugs: string[], fallbackTag: Product['tags'][number], count: number) => {
    const out: Product[] = [];
    const seen = new Set<string>();
    for (const s of slugs) {
      const hit = bySlug.get(s.toLowerCase());
      if (hit && !seen.has(hit.id)) {
        out.push(hit);
        seen.add(hit.id);
      }
    }
    if (out.length < count) {
      for (const p of all) {
        if (p.tags.includes(fallbackTag) && !seen.has(p.id)) {
          out.push(p);
          seen.add(p.id);
        }
        if (out.length >= count) break;
      }
    }
    if (out.length < count) {
      for (const p of all) {
        if (!seen.has(p.id)) {
          out.push(p);
          seen.add(p.id);
        }
        if (out.length >= count) break;
      }
    }
    return out.slice(0, count);
  };

  // Pin RFL Electric Geyser Glossy 45 Liter as Featured Hot Deal #1 just like live Othoba.com
  const geyser = all.find((p) => p.slug.includes('rfl-electric-geyser-glossy-45-liter')) ?? all.find((p) => p.slug.includes('geyser'));
  const whirlpool = all.find((p) => p.name.toLowerCase().includes('whirlpool') && p.name.toLowerCase().includes('20l'));
  const hotDealsPool = resolveBySlugs(HOT_DEAL_SLUGS, 'hot-deal', 14);

  const hotDealsFeatured = [
    ...(geyser ? [geyser] : []),
    ...(whirlpool ? [whirlpool] : []),
    ...hotDealsPool,
  ]
    .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx)
    .slice(0, 2);

  const featuredIds = new Set(hotDealsFeatured.map((p) => p.id));
  const hotDealsCompact = hotDealsPool.filter((p) => !featuredIds.has(p.id)).slice(0, 8);

  const trendingProducts = all.filter((p) => p.tags.includes('trending')).slice(0, 12);
  const featuredProducts = resolveBySlugs(RECOMMENDED_BY_TAB['featured'] ?? [], 'featured', 10);
  const newArrivalProducts = resolveBySlugs(RECOMMENDED_BY_TAB['new-arrival'] ?? [], 'new-arrival', 10);
  const topRatedProducts = resolveBySlugs(RECOMMENDED_BY_TAB['top-rated'] ?? [], 'top-rated', 10);
  const bestSellerProducts = resolveBySlugs(RECOMMENDED_BY_TAB['best-seller'] ?? [], 'best-seller', 10);

  return (
    <HomeClient
      categories={CATEGORIES}
      vendors={VENDORS}
      totalCatalogCount={all.length}
      hotDealsFeatured={hotDealsFeatured}
      hotDealsCompact={hotDealsCompact}
      trendingProducts={trendingProducts}
      featuredProducts={featuredProducts}
      newArrivalProducts={newArrivalProducts}
      topRatedProducts={topRatedProducts}
      bestSellerProducts={bestSellerProducts}
    />
  );
}
