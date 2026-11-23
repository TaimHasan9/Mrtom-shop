import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await context.params;
  const normalized = decodeURIComponent(orderNumber).replace(/^#/, '').trim().toUpperCase();
  const store = getStore();
  const order = store.orders.get(normalized);

  if (!order) {
    return NextResponse.json(
      { error: `No order found matching "${normalized}". Check your order ID (e.g. OTH-2026-1042).` },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
