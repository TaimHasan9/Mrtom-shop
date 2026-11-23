'use client';

import Link from 'next/link';
import { ChevronRight, Scale, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { useStore } from '@/components/StoreProvider';
import { formatTk } from '@/lib/store-logic';

export default function ComparePage() {
  const { compareProducts, toggleCompare, clearCompare, addToCart } = useStore();

  return (
    <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Compare Products</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Compare Products ({compareProducts.length}/4)
        </h1>
        {compareProducts.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Clear All Comparison Items
          </button>
        )}
      </div>

      {compareProducts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1e5fa8]">
            <Scale size={26} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No products selected to compare</h2>
          <p className="mt-1 text-sm text-slate-500">
            Click the scale icon on up to 4 products to compare prices, specs, ratings, and warranties side-by-side.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#164b87]"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
          <table className="w-full min-w-[680px] text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-44 p-4 font-bold text-slate-700 align-top">Feature</th>
                {compareProducts.map((p) => (
                  <th key={p.id} className="p-4 align-top min-w-[200px] border-l border-slate-200">
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(p.id, p.name)}
                        aria-label={`Remove ${p.name} from comparison`}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <Link href={`/product/${p.slug}`} className="block text-center">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="mx-auto h-32 w-32 object-contain bg-white rounded border border-slate-100 p-1"
                      />
                      <span className="mt-2.5 block font-semibold text-slate-900 hover:text-[#1e5fa8] line-clamp-2">
                        {p.name}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Price</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200 font-bold text-[#1e5fa8] tabular-nums">
                    {formatTk(p.price)}
                    {p.originalPrice > p.price && (
                      <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                        {formatTk(p.originalPrice)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Brand</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200">
                    {p.brand}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Category</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200">
                    {p.categoryName}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Rating</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {p.rating.toFixed(1)} ({p.reviewCount})
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Warranty</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200">
                    {p.warranty ?? 'Standard Support'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Delivery &amp; EMI</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200 text-xs">
                    {p.freeDelivery ? 'Free Delivery · ' : ''}
                    {p.emiMonths ? `${p.emiMonths}M 0% EMI` : 'Standard Payment'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="bg-slate-50 p-3.5 font-semibold text-slate-700">Action</th>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          productId: p.id,
                          quantity: 1,
                          openDrawer: true,
                          productName: p.name,
                        })
                      }
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#1e5fa8] px-3 py-2 text-xs font-bold text-white hover:bg-[#164b87]"
                    >
                      <ShoppingCart size={14} />
                      <span>Add to Cart</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
