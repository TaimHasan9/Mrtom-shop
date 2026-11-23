import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getAlsoBoughtProducts, getRelatedProducts, getVendorBySlug } from '@/lib/catalog';
import { enrichProduct, getEnrichedProductBySlug } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getEnrichedProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const vendor = getVendorBySlug(product.sellerSlug);
  const related = getRelatedProducts(product, 5).map(enrichProduct);
  const alsoBought = getAlsoBoughtProducts(
    product,
    related.map((r) => r.id),
    5
  ).map(enrichProduct);

  return (
    <ProductDetailClient
      initialProduct={product}
      vendor={vendor}
      relatedProducts={related}
      alsoBoughtProducts={alsoBought}
    />
  );
}
