import { notFound } from 'next/navigation';
import CatalogBrowser from '@/components/CatalogBrowser';
import { getCategoryBySlug } from '@/lib/catalog';
import { getEnrichedProducts } from '@/lib/server-store';
import { filterAndSortProducts } from '@/lib/store-logic';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const all = getEnrichedProducts();
  const inCategory = filterAndSortProducts(all, { category: category.slug });
  const initialBrands = Array.from(new Set(inCategory.map((p) => p.brand))).sort();

  const initialFiltered = filterAndSortProducts(all, {
    category: category.slug,
    subcategory: sp.sub || undefined,
    sort: (sp.sort as 'position') || 'position',
  });

  return (
    <CatalogBrowser
      key={`${category.slug}-${sp.sub ?? ''}-${sp.sort ?? ''}`}
      title={category.name}
      subtitle={`Browse genuine ${category.name} products with fast delivery across Bangladesh`}
      category={category}
      initialSubcategory={sp.sub ?? ''}
      initialSort={sp.sort ?? 'position'}
      initialProducts={initialFiltered.slice(0, 20)}
      initialTotal={initialFiltered.length}
      initialBrands={initialBrands}
    />
  );
}
