import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedProducts, registerLiveProducts } from '@/lib/server-store';
import { searchLiveOthobaCatalog } from '@/lib/othoba-live-api';
import { filterAndSortProducts, type ProductFilterOptions } from '@/lib/store-logic';
import type { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const options: ProductFilterOptions = {
    category: searchParams.get('category') ?? undefined,
    subcategory: searchParams.get('subcategory') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    seller: searchParams.get('seller') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    emiOnly: searchParams.get('emiOnly') === 'true',
    freeDeliveryOnly: searchParams.get('freeDeliveryOnly') === 'true',
    tag: (searchParams.get('tag') as Product['tags'][number]) || undefined,
    sort: (searchParams.get('sort') as ProductFilterOptions['sort']) || 'position',
  };

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '24') || 24));
  const forceLive = searchParams.get('live') === '1';

  let all = getEnrichedProducts();
  let filtered = filterAndSortProducts(all, options);

  // If user searched for a term with fewer than 6 local matches (or explicitly requested live search),
  // query live Othoba search API and register results in session-shared live catalog.
  if (options.q && options.q.trim().length >= 2 && (filtered.length < 6 || forceLive)) {
    const liveHits = await searchLiveOthobaCatalog(options.q.trim(), 24);
    if (liveHits.length > 0) {
      registerLiveProducts(liveHits);
      all = getEnrichedProducts();
      const mergedIds = new Set(filtered.map((p) => p.id));
      for (const hit of liveHits) {
        if (!mergedIds.has(hit.id)) {
          filtered.push(hit);
          mergedIds.add(hit.id);
        }
      }
      // Apply non-text filters/sorting cleanly
      filtered = filterAndSortProducts(filtered, { ...options, q: undefined });
    }
  }

  const baseForBrands = filterAndSortProducts(all, {
    category: options.category,
    subcategory: options.subcategory,
    seller: options.seller,
    q: options.q,
  });
  const availableBrands = Array.from(new Set(baseForBrands.map((p) => p.brand))).sort();

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const products = filtered.slice(start, start + limit);

  return NextResponse.json({
    products,
    total,
    page: safePage,
    limit,
    totalPages,
    availableBrands,
  });
}
