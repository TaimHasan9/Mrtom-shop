import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const store = getStore();
  const already = store.newsletterSubscribers.has(email);
  store.newsletterSubscribers.add(email);

  return NextResponse.json({
    subscribed: true,
    message: already
      ? `${email} is already subscribed to Mrtom shop deals & flash alerts.`
      : `Subscribed ${email}! Use code MRTOM10 for 10% off your next order.`,
  });
}
