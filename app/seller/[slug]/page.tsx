import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin, PackageCheck, Star } from 'lucide-react';
import CatalogBrowser from '@/components/CatalogBrowser';
import { getVendorBySlug } from '@/lib/catalog';
import { getEnrichedProducts } from '@/lib/server-store';
import { filterAndSortProducts } from '@/lib/store-logic';

export const dynamic = 'force-dynamic';

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = getVendorBySlug(slug);
  if (!vendor) {
    notFound();
  }

  const all = getEnrichedProducts();
  const sellerProducts = filterAndSortProducts(all, { seller: vendor.slug });
  const brands = Array.from(new Set(sellerProducts.map((p) => p.brand))).sort();

  return (
    <div>
      {/* Vendor Storefront Banner */}
      <div className="bg-gradient-to-r from-[#164b87] to-[#1e5fa8] text-white border-b border-blue-900">
        <div className="mx-auto flex max-w-[1360px] flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e5fa8] font-extrabold text-sm shadow-sm">
              {vendor.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{vendor.name}</h1>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                  <BadgeCheck size={13} />
                  Verified Store
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-blue-100">{vendor.tagline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-blue-100">
                <span className="inline-flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {vendor.rating.toFixed(1)} Seller Rating
                </span>
                <span className="inline-flex items-center gap-1">
                  <PackageCheck size={13} />
                  {vendor.shipOnTime}% Ship On Time
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {vendor.location}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wide">Catalog Listed</p>
            <p className="text-2xl font-extrabold tabular-nums">{sellerProducts.length} Items</p>
          </div>
        </div>
      </div>

      <CatalogBrowser
        title={`${vendor.name} Store`}
        subtitle={`Authentic products fulfilled directly by ${vendor.name}`}
        sellerSlug={vendor.slug}
        initialProducts={sellerProducts.slice(0, 20)}
        initialTotal={sellerProducts.length}
        initialBrands={brands}
      />
    </div>
  );
}
