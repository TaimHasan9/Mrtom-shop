import { NextRequest, NextResponse } from 'next/server';
import { withSessionCookie } from '@/lib/api-session';
import { findAnyProduct, getOrCreateSession, type SessionState } from '@/lib/server-store';
import { calculateCartTotals, DELIVERY_AREAS } from '@/lib/store-logic';
import type { DeliveryAreaId } from '@/lib/types';

function buildCartResponse(session: SessionState) {
  const totals = calculateCartTotals(session.cart, session.areaId, session.couponCode);
  return {
    items: session.cart,
    areaId: session.areaId,
    couponCode: session.couponCode,
    totals,
  };
}

export async function GET() {
  const { session } = await getOrCreateSession();
  return withSessionCookie(buildCartResponse(session), session.id);
}

export async function POST(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === 'string' ? body.productId : '';
  const quantity = Math.max(1, Math.min(20, Number(body.quantity ?? 1) || 1));
  const selectedVariant = typeof body.selectedVariant === 'string' ? body.selectedVariant : undefined;
  const availEmi = Boolean(body.availEmi);

  const product = findAnyProduct(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const variantKey = selectedVariant ?? product.variants?.[0]?.options[0];
  const existing = session.cart.find(
    (item) => item.productId === product.id && (item.selectedVariant ?? '') === (variantKey ?? '')
  );

  if (existing) {
    existing.quantity = Math.min(20, existing.quantity + quantity);
    if (availEmi) existing.availEmi = true;
  } else {
    session.cart.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity,
      selectedVariant: variantKey,
      availEmi,
      freeDelivery: product.freeDelivery,
      sellerName: product.sellerName,
    });
  }

  return withSessionCookie(buildCartResponse(session), session.id);
}

export async function PATCH(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const body = await req.json().catch(() => ({}));

  if (typeof body.areaId === 'string') {
    const valid = DELIVERY_AREAS.some((a) => a.id === body.areaId);
    if (valid) {
      session.areaId = body.areaId as DeliveryAreaId;
    }
  }

  if (typeof body.couponCode === 'string') {
    session.couponCode = body.couponCode.trim().toUpperCase();
  }

  if (typeof body.productId === 'string') {
    const variantKey = typeof body.selectedVariant === 'string' ? body.selectedVariant : undefined;
    const qty = Number(body.quantity);
    const idx = session.cart.findIndex(
      (i) =>
        i.productId === body.productId &&
        (variantKey === undefined || (i.selectedVariant ?? '') === variantKey)
    );
    if (idx !== -1) {
      if (!Number.isFinite(qty) || qty <= 0) {
        session.cart.splice(idx, 1);
      } else {
        session.cart[idx].quantity = Math.min(20, Math.round(qty));
      }
    }
  }

  return withSessionCookie(buildCartResponse(session), session.id);
}

export async function DELETE(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const selectedVariant = searchParams.get('variant');

  if (!productId) {
    session.cart = [];
    session.couponCode = '';
  } else {
    session.cart = session.cart.filter(
      (i) =>
        !(
          i.productId === productId &&
          (selectedVariant === null || (i.selectedVariant ?? '') === selectedVariant)
        )
    );
  }

  return withSessionCookie(buildCartResponse(session), session.id);
}
