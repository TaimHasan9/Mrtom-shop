import { NextRequest, NextResponse } from 'next/server';
import { addQuestionToProduct, getEnrichedProductBySlug } from '@/lib/server-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = await req.json().catch(() => ({}));
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const question = typeof body.question === 'string' ? body.question.trim() : '';

  if (author.length < 2) {
    return NextResponse.json({ error: 'Please enter your name (at least 2 characters).' }, { status: 400 });
  }
  if (question.length < 6) {
    return NextResponse.json({ error: 'Please enter a valid question (at least 6 characters).' }, { status: 400 });
  }

  const qa = addQuestionToProduct(slug, { author, question });
  if (!qa) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const product = getEnrichedProductBySlug(slug);
  return NextResponse.json({ qa, product }, { status: 201 });
}
