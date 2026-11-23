import { NextResponse } from 'next/server';
import { ALL_PRODUCTS, CATEGORIES, DIRECTORY_HIGHLIGHTS } from '@/lib/catalog';

export async function GET() {
  const enriched = CATEGORIES.map((cat) => ({
    ...cat,
    productCount: ALL_PRODUCTS.filter((p) => p.categorySlug === cat.slug).length,
  }));
  return NextResponse.json({ categories: enriched, directoryHighlights: DIRECTORY_HIGHLIGHTS });
}
