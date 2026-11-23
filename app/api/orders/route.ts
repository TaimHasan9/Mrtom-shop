import { NextRequest, NextResponse } from 'next/server';
import { withSessionCookie } from '@/lib/api-session';
import { getOrCreateSession, getStore, placeOrderFromSession } from '@/lib/server-store';

export async function GET() {
  const { session } = await getOrCreateSession();
  const store = getStore();
  let orders = Array.from(store.orders.values());

  if (session.userId) {
    const ids = store.userOrders.get(session.userId) ?? [];
    orders = ids.map((id) => store.orders.get(id)!).filter(Boolean);
  } else {
    orders = orders.slice(-5).reverse();
  }

  return withSessionCookie({ orders }, session.id);
}

export async function POST(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const body = await req.json().catch(() => ({}));

  const result = placeOrderFromSession(session, {
    customerName: typeof body.customerName === 'string' ? body.customerName : '',
    phone: typeof body.phone === 'string' ? body.phone : '',
    email: typeof body.email === 'string' ? body.email : undefined,
    areaId: body.areaId,
    address: typeof body.address === 'string' ? body.address : '',
    notes: typeof body.notes === 'string' ? body.notes : undefined,
    paymentMethod: body.paymentMethod,
    couponCode: typeof body.couponCode === 'string' ? body.couponCode : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return withSessionCookie({ order: result.order }, session.id, 201);
}
