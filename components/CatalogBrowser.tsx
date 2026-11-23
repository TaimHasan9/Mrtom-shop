'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, RotateCcw, SlidersHorizontal, Star, X } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface CatalogBrowserProps {
  title: string;
  subtitle?: string;
  category?: Category;
  initialSubcategory?: string;
  initialQuery?: string;
  initialSort?: string;
  initialTag?: string;
  sellerSlug?: string;
  initialProducts: Product[];
  initialTotal: number;
  initialBrands: string[];
}

function buildPaginationWindow(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) pages.push('ellipsis');
  for (let p = left; p <= right; p++) {
    pages.push(p);
  }
  if (right < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export default function CatalogBrowser({
  title,
  subtitle,
  category,
  initialSubcategory = '',
  initialQuery = '',
  initialSort = 'position',
  initialTag = '',
  sellerSlug = '',
  initialProducts,
  initialTotal,
  initialBrands,
}: CatalogBrowserProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialTotal);
  const [brands, setBrands] = useState<string[]>(initialBrands);
  const [brandSearch, setBrandSearch] = useState('');

  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [emiOnly, setEmiOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [sort, setSort] = useState(initialSort);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, Math.ceil(initialTotal / 20)));
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchFiltered = async (opts?: {
    nextSub?: string;
    nextBrands?: string[];
    nextMin?: string;
    nextMax?: string;
    nextRating?: number;
    nextEmi?: boolean;
    nextFree?: boolean;
    nextSort?: string;
    nextLimit?: number;
    nextPage?: number;
  }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category?.slug) params.set('category', category.slug);
      if (sellerSlug) params.set('seller', sellerSlug);
      if (initialQuery) params.set('q', initialQuery);
      if (initialTag) params.set('tag', initialTag);

      const sub = opts?.nextSub !== undefined ? opts.nextSub : subcategory;
      const bList = opts?.nextBrands !== undefined ? opts.nextBrands : selectedBrands;
      const minP = opts?.nextMin !== undefined ? opts.nextMin : minPrice;
      const maxP = opts?.nextMax !== undefined ? opts.nextMax : maxPrice;
      const rat = opts?.nextRating !== undefined ? opts.nextRating : minRating;
      const emi = opts?.nextEmi !== undefined ? opts.nextEmi : emiOnly;
      const free = opts?.nextFree !== undefined ? opts.nextFree : freeDeliveryOnly;
      const srt = opts?.nextSort !== undefined ? opts.nextSort : sort;
      const lim = opts?.nextLimit !== undefined ? opts.nextLimit : pageSize;
      const pg = opts?.nextPage !== undefined ? opts.nextPage : page;

      if (sub) params.set('subcategory', sub);
      if (bList.length > 0) params.set('brand', bList.join(','));
      if (minP) params.set('minPrice', minP);
      if (maxP) params.set('maxPrice', maxP);
      if (rat > 0) params.set('minRating', String(rat));
      if (emi) params.set('emiOnly', 'true');
      if (free) params.set('freeDeliveryOnly', 'true');
      if (srt) params.set('sort', srt);
      params.set('page', String(pg));
      params.set('limit', String(lim));

      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(data.page ?? 1);
        if (Array.isArray(data.availableBrands)) {
          setBrands(data.availableBrands);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    setPage(1);
    fetchFiltered({ nextBrands: next, nextPage: 1 });
  };

  const handleResetFilters = () => {
    setSubcategory('');
    setSelectedBrands([]);
    setBrandSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setEmiOnly(false);
    setFreeDeliveryOnly(false);
    setSort('position');
    setPage(1);
    fetchFiltered({
      nextSub: '',
      nextBrands: [],
      nextMin: '',
      nextMax: '',
      nextRating: 0,
      nextEmi: false,
      nextFree: false,
      nextSort: 'position',
      nextPage: 1,
    });
  };

  const filteredBrandList = brandSearch.trim()
    ? brands.filter((b) => b.toLowerCase().includes(brandSearch.trim().toLowerCase()))
    : brands;

  const pageTokens = buildPaginationWindow(page, totalPages);

  const filterPanel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Filter size={15} className="text-[#1868b7]" />
          Filters
        </span>
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1868b7] hover:underline"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Category & Subcategory Sidebar Tree (matches othoba-category.png) */}
      {category && category.subcategories.length > 0 && (
        <div>
          <div className="border-b border-slate-200 mb-2.5">
            <h3 className="inline-block border-b-2 border-slate-900 pb-1 text-xs font-bold text-slate-900">
              Categories
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubcategory('');
              setPage(1);
              fetchFiltered({ nextSub: '', nextPage: 1 });
            }}
            className={`block w-full text-left py-1 text-xs font-bold ${
              subcategory === '' ? 'text-[#1868b7]' : 'text-slate-800 hover:text-[#1868b7]'
            }`}
          >
            {category.name}
          </button>
          <div className="mt-1 space-y-1 max-h-48 overflow-y-auto pr-1">
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSubcategory(sub.slug);
                  setPage(1);
                  fetchFiltered({ nextSub: sub.slug, nextPage: 1 });
                }}
                className={`block w-full text-left py-1 pl-2 text-xs transition-colors ${
                  subcategory === sub.slug
                    ? 'font-bold text-[#1868b7]'
                    : 'text-slate-600 hover:text-[#1868b7]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <div className="border-b border-slate-200 mb-2.5">
          <h3 className="inline-block border-b-2 border-slate-900 pb-1 text-xs font-bold text-slate-900">
            Price Range (Tk)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#1868b7] focus:outline-none"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#1868b7] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            fetchFiltered({ nextPage: 1 });
          }}
          className="mt-2 w-full rounded bg-slate-800 py-1.5 text-xs font-semibold text-white hover:bg-[#1868b7] transition-colors"
        >
          Apply Price
        </button>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <div className="border-b border-slate-200 mb-2.5">
            <h3 className="inline-block border-b-2 border-slate-900 pb-1 text-xs font-bold text-slate-900">
              Brands ({brands.length})
            </h3>
          </div>
          {brands.length > 8 && (
            <input
              type="search"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Filter brands..."
              aria-label="Search brands"
              className="mb-2 w-full rounded border border-slate-200 px-2.5 py-1 text-xs focus:border-[#1868b7] focus:outline-none"
            />
          )}
          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {filteredBrandList.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-[#1868b7]"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleToggleBrand(brand)}
                  className="rounded border-slate-300 text-[#1868b7] focus:ring-[#1868b7]"
                />
                <span className="truncate">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <div className="border-b border-slate-200 mb-2.5">
          <h3 className="inline-block border-b-2 border-slate-900 pb-1 text-xs font-bold text-slate-900">
            Customer Rating
          </h3>
        </div>
        <div className="space-y-1.5 text-xs">
          {[4.5, 4, 0].map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                name="minRating"
                checked={minRating === val}
                onChange={() => {
                  setMinRating(val);
                  setPage(1);
                  fetchFiltered({ nextRating: val, nextPage: 1 });
                }}
              />
              {val > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="fill-[#f6921e] text-[#f6921e]" />
                  {val}+ Stars
                </span>
              ) : (
                <span>All Ratings</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={emiOnly}
            onChange={(e) => {
              const next = e.target.checked;
              setEmiOnly(next);
              setPage(1);
              fetchFiltered({ nextEmi: next, nextPage: 1 });
            }}
          />
          <span>0% EMI Available</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={freeDeliveryOnly}
            onChange={(e) => {
              const next = e.target.checked;
              setFreeDeliveryOnly(next);
              setPage(1);
              fetchFiltered({ nextFree: next, nextPage: 1 });
            }}
          />
          <span>Free Delivery Eligible</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-4 space-y-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1868b7]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">{title}</span>
      </nav>

      {/* Subcategory Pastel-Blue Circles Strip (matches othoba-category.png) */}
      {category && category.subcategories.length > 0 && (
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
          {category.subcategories.map((sub) => {
            const active = subcategory === sub.slug;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  const next = active ? '' : sub.slug;
                  setSubcategory(next);
                  setPage(1);
                  fetchFiltered({ nextSub: next, nextPage: 1 });
                }}
                className="group flex w-24 shrink-0 flex-col items-center text-center"
              >
                <div
                  className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full p-2.5 transition-all ${
                    active
                      ? 'bg-[radial-gradient(circle_at_35%_30%,#dbf2ff_0%,#7ec8f8_100%)] ring-2 ring-[#1868b7] ring-offset-2'
                      : 'bg-[radial-gradient(circle_at_35%_30%,#eaf8ff_0%,#96dbfb_100%)] group-hover:scale-105'
                  }`}
                >
                  <img
                    src={sub.image}
                    alt={sub.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-full object-contain"
                  />
                </div>
                <span
                  className={`mt-2 text-xs leading-tight line-clamp-2 ${
                    active ? 'font-bold text-[#1868b7]' : 'font-semibold text-slate-800'
                  }`}
                >
                  {sub.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold text-[#1868b7] bg-blue-50 border border-blue-200 rounded px-3 py-1 self-start sm:self-auto tabular-nums">
          {total.toLocaleString()} Products
        </span>
      </div>

      {/* Main Split: Sidebar Filters + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-5">
        <aside className="hidden lg:block w-60 shrink-0 self-start bg-white pr-2">
          {filterPanel}
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar (Sort by + Show 20/40/60 matching othoba-category.png) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
              <div className="flex items-center gap-2">
                <label htmlFor="catalog-sort" className="text-xs font-bold text-slate-800">
                  Sort by
                </label>
                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSort(next);
                    setPage(1);
                    fetchFiltered({ nextSort: next, nextPage: 1 });
                  }}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-[#1868b7] focus:outline-none"
                >
                  <option value="position">Position</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-500 tabular-nums">
                Showing {products.length} of {total.toLocaleString()}
              </span>
              <select
                aria-label="Products per page"
                value={pageSize}
                onChange={(e) => {
                  const nextLim = Number(e.target.value);
                  setPageSize(nextLim);
                  setPage(1);
                  fetchFiltered({ nextLimit: nextLim, nextPage: 1 });
                }}
                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-[#1868b7] focus:outline-none"
              >
                <option value={20}>Show 20</option>
                <option value={40}>Show 40</option>
                <option value={60}>Show 60</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 animate-pulse rounded border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
              <p className="text-base font-bold text-slate-800">No matching products found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your price range, clearing brand filters, or searching another term.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded bg-[#1868b7] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125293]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Windowed Ellipsis Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => fetchFiltered({ nextPage: page - 1 })}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:border-[#1868b7]"
              >
                Previous
              </button>
              {pageTokens.map((tok, i) =>
                tok === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => fetchFiltered({ nextPage: tok })}
                    className={`rounded border px-3 py-1.5 text-xs font-semibold tabular-nums ${
                      tok === page
                        ? 'border-[#1868b7] bg-[#1868b7] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#1868b7]'
                    }`}
                  >
                    {tok}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => fetchFiltered({ nextPage: page + 1 })}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:border-[#1868b7]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-black/45"
          />
          <div className="relative z-10 h-full w-72 bg-white p-4 shadow-2xl overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded p-1 text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
