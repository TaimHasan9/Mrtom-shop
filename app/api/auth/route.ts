import { NextRequest, NextResponse } from 'next/server';
import { withSessionCookie } from '@/lib/api-session';
import { getOrCreateSession, getStore, sanitizeUser, type StoredUser } from '@/lib/server-store';
import { DELIVERY_AREAS } from '@/lib/store-logic';
import type { DeliveryAreaId } from '@/lib/types';

export async function GET() {
  const { session } = await getOrCreateSession();
  const store = getStore();
  const user = session.userId ? store.users.get(session.userId) ?? null : null;
  const orderIds = user ? store.userOrders.get(user.id) ?? [] : [];
  const orders = orderIds.map((id) => store.orders.get(id)!).filter(Boolean);

  return withSessionCookie({ user: user ? sanitizeUser(user) : null, orders }, session.id);
}

export async function POST(req: NextRequest) {
  const { session } = await getOrCreateSession();
  const store = getStore();
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === 'demo') {
    const demoUser = store.users.get('user-demo-1');
    if (demoUser) {
      session.userId = demoUser.id;
      const orderIds = store.userOrders.get(demoUser.id) ?? [];
      const orders = orderIds.map((id) => store.orders.get(id)!).filter(Boolean);
      return withSessionCookie({ user: sanitizeUser(demoUser), orders }, session.id);
    }
  }

  if (action === 'login') {
    const emailOrPhone = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Please enter your email/phone and password.' }, { status: 400 });
    }
    const found = Array.from(store.users.values()).find(
      (u) => (u.email.toLowerCase() === emailOrPhone || u.phone === emailOrPhone) && u.password === password
    );
    if (!found) {
      return NextResponse.json({ error: 'Invalid credentials. Try demo account or register a new profile.' }, { status: 401 });
    }
    session.userId = found.id;
    const orderIds = store.userOrders.get(found.id) ?? [];
    const orders = orderIds.map((id) => store.orders.get(id)!).filter(Boolean);
    return withSessionCookie({ user: sanitizeUser(found), orders }, session.id);
  }

  if (action === 'register') {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const areaId: DeliveryAreaId = DELIVERY_AREAS.some((a) => a.id === body.defaultAreaId)
      ? body.defaultAreaId
      : 'dhaka-north';
    const address = typeof body.defaultAddress === 'string' ? body.defaultAddress.trim() : 'Dhaka, Bangladesh';

    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json({ error: 'Enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    const exists = Array.from(store.users.values()).some((u) => u.email.toLowerCase() === email);
    if (exists) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      password,
      defaultAreaId: areaId,
      defaultAddress: address,
    };
    store.users.set(newUser.id, newUser);
    store.userOrders.set(newUser.id, []);
    session.userId = newUser.id;
    return withSessionCookie({ user: sanitizeUser(newUser), orders: [] }, session.id, 201);
  }

  if (action === 'update') {
    if (!session.userId) {
      return NextResponse.json({ error: 'Sign in first to update your profile.' }, { status: 401 });
    }
    const existing = store.users.get(session.userId);
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    if (typeof body.name === 'string' && body.name.trim().length >= 2) {
      existing.name = body.name.trim();
    }
    if (typeof body.phone === 'string' && /^(\+?88)?01[3-9]\d{8}$/.test(body.phone.replace(/[\s-]/g, ''))) {
      existing.phone = body.phone.trim();
    }
    if (DELIVERY_AREAS.some((a) => a.id === body.defaultAreaId)) {
      existing.defaultAreaId = body.defaultAreaId;
    }
    if (typeof body.defaultAddress === 'string' && body.defaultAddress.trim().length >= 5) {
      existing.defaultAddress = body.defaultAddress.trim();
    }
    const orderIds = store.userOrders.get(existing.id) ?? [];
    const orders = orderIds.map((id) => store.orders.get(id)!).filter(Boolean);
    return withSessionCookie({ user: sanitizeUser(existing), orders }, session.id);
  }

  return NextResponse.json({ error: 'Invalid auth action.' }, { status: 400 });
}

export async function DELETE() {
  const { session } = await getOrCreateSession();
  session.userId = null;
  return withSessionCookie({ user: null, orders: [] }, session.id);
}
