import { NextRequest, NextResponse } from 'next/server';
import { addReviewToProduct, getEnrichedProductBySlug } from '@/lib/server-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = await req.json().catch(() => ({}));
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const rating = Number(body.rating);

  if (author.length < 2) {
    return NextResponse.json({ error: 'Please enter your name (at least 2 characters).' }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }
  if (comment.length < 5) {
    return NextResponse.json({ error: 'Please write a short review (at least 5 characters).' }, { status: 400 });
  }

  const review = addReviewToProduct(slug, { author, rating, comment });
  if (!review) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const product = getEnrichedProductBySlug(slug);
  return NextResponse.json({ review, product }, { status: 201 });
}
