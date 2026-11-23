import { NextRequest, NextResponse } from 'next/server';
import { getRelatedProducts } from '@/lib/catalog';
import { enrichProduct, getEnrichedProductBySlug } from '@/lib/server-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const product = getEnrichedProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const related = getRelatedProducts(product, 5).map(enrichProduct);
  return NextResponse.json({ product, related });
}
