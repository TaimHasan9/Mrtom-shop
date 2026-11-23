import CatalogBrowser from '@/components/CatalogBrowser';
import { getEnrichedProducts } from '@/lib/server-store';
import { filterAndSortProducts } from '@/lib/store-logic';

export const dynamic = 'force-dynamic';

export default function DealsPage() {
  const all = getEnrichedProducts();
  const hotDeals = filterAndSortProducts(all, { tag: 'hot-deal', sort: 'discount' });
  const brands = Array.from(new Set(hotDeals.map((p) => p.brand))).sort();

  return (
    <CatalogBrowser
      title="Hot Deals & Flash Offers"
      subtitle="Today's biggest markdowns — plus extra 10% off with coupon code MRTOM10"
      initialTag="hot-deal"
      initialSort="discount"
      initialProducts={hotDeals.slice(0, 20)}
      initialTotal={hotDeals.length}
      initialBrands={brands}
    />
  );
}
