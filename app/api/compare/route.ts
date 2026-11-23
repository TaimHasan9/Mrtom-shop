import { NextRequest, NextResponse } from 'next/server';
import { withSessionCookie } from '@/lib/api-session';
import { findAnyProduct, getEnrichedProducts, getOrCreateSession } from '@/lib/server-store';

export async function GET() {
  const { session } = await getOrCreateSession();
  const all = getEnrichedProducts();
  const products = all.filter((p) => session.compare.includes(p.id));
  return withSessionCookie({ productIds: session.compare, products }, session.id);
}

export async function POST(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const body = await req.json().catch(() => ({}));

  if (body.clear) {
    session.compare = [];
    return withSessionCookie({ added: false, productIds: [], products: [] }, session.id);
  }

  const productId = typeof body.productId === 'string' ? body.productId : '';
  const exists = findAnyProduct(productId);
  if (!exists) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const all = getEnrichedProducts();

  const idx = session.compare.indexOf(productId);
  let added = false;
  if (idx >= 0) {
    session.compare.splice(idx, 1);
  } else {
    if (session.compare.length >= 4) {
      session.compare.pop();
    }
    session.compare.unshift(productId);
    added = true;
  }

  const products = all.filter((p) => session.compare.includes(p.id));
  return withSessionCookie({ added, productIds: session.compare, products }, session.id);
}
