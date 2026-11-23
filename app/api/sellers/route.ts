import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
  const ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';

  if (businessName.length < 2 || ownerName.length < 2) {
    return NextResponse.json({ error: 'Please provide both business name and owner name.' }, { status: 400 });
  }
  if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
    return NextResponse.json({ error: 'Enter a valid 11-digit Bangladesh mobile number.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid business email address.' }, { status: 400 });
  }

  const store = getStore();
  const application = {
    id: `SEL-${Date.now().toString().slice(-6)}`,
    businessName,
    ownerName,
    phone,
    email,
    category: category || 'General Merchandise',
    city: city || 'Dhaka',
    createdAt: new Date().toISOString(),
  };
  store.sellerApplications.unshift(application);

  return NextResponse.json(
    {
      application,
      message: `Application ${application.id} received! Our Mrtom shop Merchant Onboarding team will contact ${phone} within 24 hours.`,
    },
    { status: 201 }
  );
}
