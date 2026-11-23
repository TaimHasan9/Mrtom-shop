import { NextRequest, NextResponse } from 'next/server';
import { withSessionCookie } from '@/lib/api-session';
import { findAnyProduct, getEnrichedProducts, getOrCreateSession } from '@/lib/server-store';

export async function GET() {
  const { session } = await getOrCreateSession();
  const all = getEnrichedProducts();
  const products = all.filter((p) => session.wishlist.includes(p.id));
  return withSessionCookie({ productIds: session.wishlist, products }, session.id);
}

export async function POST(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === 'string' ? body.productId : '';
  const exists = findAnyProduct(productId);
  if (!exists) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const all = getEnrichedProducts();

  const idx = session.wishlist.indexOf(productId);
  let added = false;
  if (idx >= 0) {
    session.wishlist.splice(idx, 1);
  } else {
    session.wishlist.unshift(productId);
    added = true;
  }

  const products = all.filter((p) => session.wishlist.includes(p.id));
  return withSessionCookie({ added, productIds: session.wishlist, products }, session.id);
}
