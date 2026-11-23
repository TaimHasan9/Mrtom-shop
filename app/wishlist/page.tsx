'use client';

import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/components/StoreProvider';

export default function WishlistPage() {
  const { wishlistProducts } = useStore();

  return (
    <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">My Wishlist</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          My Wishlist ({wishlistProducts.length})
        </h1>
        <Link href="/products" className="text-xs sm:text-sm font-semibold text-[#1e5fa8] hover:underline">
          Explore More Products &rarr;
        </Link>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Heart size={26} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-slate-500">
            Click the heart icon on any product card to save favorites here for later.
          </p>
          <Link
            href="/deals"
            className="mt-5 inline-block rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#164b87]"
          >
            Explore Hot Deals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
