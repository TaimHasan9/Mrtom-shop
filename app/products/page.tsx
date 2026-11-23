import CatalogBrowser from '@/components/CatalogBrowser';
import { getCategoryBySlug } from '@/lib/catalog';
import { searchLiveOthobaCatalog } from '@/lib/othoba-live-api';
import { getEnrichedProducts, registerLiveProducts } from '@/lib/server-store';
import { filterAndSortProducts, type ProductFilterOptions } from '@/lib/store-logic';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ? getCategoryBySlug(sp.category) : undefined;
  let all = getEnrichedProducts();

  let filtered = filterAndSortProducts(all, {
    category: sp.category || undefined,
    q: sp.q || undefined,
    sort: (sp.sort as ProductFilterOptions['sort']) || 'position',
  });

  if (sp.q && sp.q.trim().length >= 2 && filtered.length < 6) {
    const liveHits = await searchLiveOthobaCatalog(sp.q.trim(), 24);
    if (liveHits.length > 0) {
      registerLiveProducts(liveHits);
      all = getEnrichedProducts();
      const seen = new Set(filtered.map((p) => p.id));
      for (const hit of liveHits) {
        if (!seen.has(hit.id)) {
          filtered.push(hit);
          seen.add(hit.id);
        }
      }
      filtered = filterAndSortProducts(filtered, {
        category: sp.category || undefined,
        sort: (sp.sort as ProductFilterOptions['sort']) || 'position',
      });
    }
  }

  const brands = Array.from(new Set(filtered.map((p) => p.brand))).sort();

  const title = sp.q
    ? `Search Results for "${sp.q}"`
    : category
    ? category.name
    : 'All Mrtom shop Products';

  return (
    <CatalogBrowser
      key={`${sp.category ?? 'all'}-${sp.q ?? ''}-${sp.sort ?? ''}`}
      title={title}
      subtitle={
        sp.q
          ? `Found ${filtered.length} matching products across Mrtom shop`
          : `Explore ${all.length.toLocaleString()} genuine products across 24 shopping departments`
      }
      category={category}
      initialQuery={sp.q ?? ''}
      initialSort={sp.sort ?? 'position'}
      initialProducts={filtered.slice(0, 20)}
      initialTotal={filtered.length}
      initialBrands={brands}
    />
  );
}
