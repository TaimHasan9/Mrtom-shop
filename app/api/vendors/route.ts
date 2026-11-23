import { NextResponse } from 'next/server';
import { VENDORS } from '@/lib/catalog';

export async function GET() {
  return NextResponse.json({ vendors: VENDORS });
}
