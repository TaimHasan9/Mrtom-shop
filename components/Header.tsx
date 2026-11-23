'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  LayoutGrid,
  Loader2,
  Menu,
  PhoneCall,
  Scale,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import { CATEGORIES, DIRECTORY_HIGHLIGHTS } from '@/lib/catalog/categories';
import { formatTk } from '@/lib/store-logic';
import type { Product } from '@/lib/types';
import OthobaLogo from './OthobaLogo';
import { useStore } from './StoreProvider';

const QUICK_NAV_LINKS = [
  { label: 'Hot Deals', href: '/deals', highlight: true },
  { label: 'Mobiles & Tablets', href: '/category/mobiles-tablets' },
  { label: 'Groceries', href: '/category/groceries' },
  { label: 'Furniture', href: '/category/furniture' },
  { label: 'Home Appliances', href: '/category/home-appliances' },
  { label: 'Kitchen & Dining', href: '/category/kitchen-dining' },
  { label: 'Beauty & Care', href: '/category/beauty-personal-care' },
  { label: 'Toys & Games', href: '/category/toys-games' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const {
    totals,
    wishlistIds,
    compareIds,
    user,
    cartPulseTick,
    setCartOpen,
    setAppDealsOpen,
  } = useStore();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCatSlug, setActiveCatSlug] = useState(CATEGORIES[0]?.slug ?? 'mobiles-tablets');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suppressSuggestionsRef = useRef(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || suppressSuggestionsRef.current) {
      return;
    }
    const timer = setTimeout(async () => {
      if (suppressSuggestionsRef.current) return;
      setSearching(true);
      try {
        const params = new URLSearchParams({ q: trimmed, limit: '6' });
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok && !suppressSuggestionsRef.current) {
          const data = await res.json();
          setSuggestions(data.products ?? []);
          setShowSuggestions(true);
        }
      } catch {
        // ignore abort/network error
      } finally {
        setSearching(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    suppressSuggestionsRef.current = true;
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };

  const activeCategory = CATEGORIES.find((c) => c.slug === activeCatSlug) ?? CATEGORIES[0];

  return (
    <header className="w-full z-40 sticky top-0 bg-white shadow-2xs" ref={megaMenuRef}>
      {/* Top White Utility Bar */}
      <div className="bg-white border-b border-slate-100 text-slate-600 text-[11px]">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 px-3 sm:px-6 h-7 overflow-hidden">
          <div className="hidden sm:flex items-center gap-3.5 min-w-0 shrink-0 text-slate-500">
            <button
              type="button"
              onClick={() => setMegaMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#1868b7] whitespace-nowrap"
            >
              <LayoutGrid size={12} />
              <span>All {CATEGORIES.length} Categories</span>
            </button>
            <span className="text-slate-300">|</span>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1 hover:text-[#1868b7] whitespace-nowrap"
            >
              <Truck size={12} />
              <span>Track Order</span>
            </Link>
            <span className="text-slate-300">|</span>
            <a
              href="tel:09613800800"
              className="inline-flex items-center gap-1 hover:text-[#1868b7] whitespace-nowrap"
            >
              <PhoneCall size={11} className="text-[#1868b7]" />
              <span>09613-800800</span>
            </a>
          </div>

          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setAppDealsOpen(true)}
              className="inline-flex items-center gap-1 font-bold text-[#1868b7] hover:text-[#f26522] transition-colors whitespace-nowrap tracking-wide"
            >
              <Smartphone size={12} className="shrink-0" />
              <span>GET APP DEALS</span>
            </button>
            <Link
              href="/sell-on-othoba"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#1868b7] whitespace-nowrap tracking-wide"
            >
              <Store size={12} className="shrink-0" />
              <span>SELL ON MRTOM SHOP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Cobalt Blue Header Bar (#1868b7) */}
      <div className="bg-[#1868b7] text-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 sm:gap-5 px-3 sm:px-6 h-14 sm:h-16">
          {/* Left: Mobile Menu + Mrtom shop Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open category navigation menu"
              className="lg:hidden rounded p-1 text-white hover:bg-white/15"
            >
              <Menu size={22} />
            </button>
            <OthobaLogo variant="light" size="md" />
          </div>

          {/* Center: Clean White Search Bar */}
          <div
            ref={searchContainerRef}
            className="relative flex-1 max-w-[600px] min-w-0"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-9 sm:h-10 w-full items-center overflow-hidden rounded-[3px] bg-white text-slate-800 shadow-2xs"
            >
              <button
                type="submit"
                aria-label="Submit search"
                className="flex h-full items-center justify-center pl-2.5 sm:pl-3.5 pr-1.5 text-[#5b3fa2] hover:text-[#1868b7] transition-colors shrink-0"
              >
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={17} strokeWidth={2.2} />}
              </button>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  suppressSuggestionsRef.current = false;
                  setQuery(val);
                  if (val.trim().length < 2) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (!suppressSuggestionsRef.current && query.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Search products on Mrtom shop..."
                aria-label="Search products"
                className="h-full flex-1 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0 bg-transparent"
              />
            </form>

            {/* Live Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-slate-200 bg-white shadow-xl overflow-hidden text-slate-800"
                >
                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded border border-slate-200 object-contain bg-white shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.brand} · {item.categoryName}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#1868b7] tabular-nums shrink-0">
                            {formatTk(item.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500">
                      {searching
                        ? `Searching Mrtom shop catalog for "${query.trim()}"...`
                        : `Press Enter to search full catalog & live store for "${query.trim()}"`}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full bg-slate-50 px-3.5 py-2 text-center text-xs font-semibold text-[#1868b7] hover:bg-slate-100 border-t border-slate-200"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
            <Link
              href="/account"
              aria-label={user ? `Account (${user.name})` : 'Sign In | Register'}
              className="hidden sm:inline-flex items-center gap-1.5 px-1.5 py-1 text-xs font-medium text-white hover:text-blue-100 transition-colors whitespace-nowrap shrink-0"
            >
              <User size={16} />
              <span>{user ? user.name.split(' ')[0] : 'Sign In | Register'}</span>
            </Link>

            <div className="hidden sm:block h-7 w-px bg-white/30" />

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistIds.length} items)`}
              className="relative hidden sm:flex flex-col items-center justify-center px-1.5 py-0.5 text-white hover:text-blue-100 transition-colors shrink-0"
            >
              <div className="relative">
                <Heart size={20} strokeWidth={1.8} />
                {wishlistIds.length > 0 && (
                  <motion.span
                    key={wishlistIds.length}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#3598db] px-1 text-[10px] font-bold text-white tabular-nums"
                  >
                    {wishlistIds.length}
                  </motion.span>
                )}
              </div>
              <span className="text-[11px] leading-tight mt-0.5">Wishlist</span>
            </Link>

            <Link
              href="/compare"
              aria-label={`Compare (${compareIds.length} items)`}
              className="relative hidden sm:flex flex-col items-center justify-center px-1.5 py-0.5 text-white hover:text-blue-100 transition-colors shrink-0"
            >
              <div className="relative">
                <Scale size={20} strokeWidth={1.8} />
                {compareIds.length > 0 && (
                  <motion.span
                    key={compareIds.length}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#3598db] px-1 text-[10px] font-bold text-white tabular-nums"
                  >
                    {compareIds.length}
                  </motion.span>
                )}
              </div>
              <span className="text-[11px] leading-tight mt-0.5">Compare</span>
            </Link>

            <button
              type="button"
              data-cart-target="true"
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping cart (${totals.itemCount} items)`}
              className="relative flex flex-col items-center justify-center px-1.5 py-0.5 text-white hover:text-blue-100 transition-colors shrink-0"
            >
              <div className="relative">
                <motion.div
                  key={`cart-icon-${cartPulseTick}`}
                  animate={
                    cartPulseTick > 0
                      ? { rotate: [0, -16, 14, -8, 4, 0], scale: [1, 1.24, 0.94, 1] }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.48 }}
                >
                  <ShoppingCart size={21} strokeWidth={1.8} />
                </motion.div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={totals.itemCount}
                    data-testid="header-cart-count"
                    initial={{ scale: 1.5, y: -4, opacity: 0.75 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 18 }}
                    className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[1.1rem] items-center justify-center rounded-full bg-[#f26522] px-1 text-[10px] font-bold text-white tabular-nums shadow-2xs ring-1 ring-white/80"
                  >
                    {totals.itemCount}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="hidden sm:block text-[11px] leading-tight mt-0.5">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* White BROWSE CATEGORIES Sub-Bar (shown on subpages) */}
      {!isHome && (
        <nav
          aria-label="Primary category navigation"
          className="hidden lg:block bg-white border-b border-slate-200 text-slate-800"
        >
          <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 h-11">
            <div className="flex items-center gap-6 h-full min-w-0">
              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                aria-expanded={megaMenuOpen}
                className="inline-flex h-full items-center gap-3 border-r border-slate-200 pr-6 text-xs font-bold uppercase tracking-wide text-slate-900 hover:text-[#1868b7] transition-colors whitespace-nowrap shrink-0"
              >
                <Menu size={16} />
                <span>BROWSE CATEGORIES</span>
                <ChevronDown size={14} className="text-slate-500 ml-2" />
              </button>

              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
                {QUICK_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      link.highlight
                        ? 'text-[#d91b24] font-bold hover:text-[#b9151d]'
                        : 'text-slate-700 hover:text-[#1868b7]'
                    }`}
                  >
                    {link.highlight && <Flame size={13} />}
                    <span>{link.label}</span>
                  </Link>
                ))}
                <Link
                  href="/products"
                  className="text-xs font-semibold text-[#1868b7] hover:underline whitespace-nowrap shrink-0"
                >
                  All Products
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Full 24-Category Mega-Menu Dropdown */}
      <div className="relative mx-auto max-w-[1360px]">
        <AnimatePresence>
          {megaMenuOpen && activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.14 }}
              className="hidden lg:grid absolute left-3 right-3 sm:left-6 sm:right-6 top-0 z-50 grid-cols-12 rounded-b-lg border border-slate-200 bg-white text-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="col-span-4 border-r border-slate-200 bg-slate-50 py-2 max-h-[460px] overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveCatSlug(cat.slug)}
                    className={`flex items-center justify-between gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                      activeCategory.slug === cat.slug
                        ? 'bg-white text-[#1868b7] font-semibold border-l-4 border-[#1868b7]'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {cat.menuIcon && (
                      <img
                        src={cat.menuIcon}
                        alt=""
                        className="h-5 w-5 rounded object-contain shrink-0"
                      />
                    )}
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex-1 truncate"
                    >
                      {cat.name}
                    </Link>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="col-span-8 p-5 flex flex-col justify-between bg-white max-h-[460px] overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">{activeCategory.name}</h3>
                    <Link
                      href={`/category/${activeCategory.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-xs font-semibold text-[#1868b7] hover:underline"
                    >
                      View all products &rarr;
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {activeCategory.subcategories.slice(0, 12).map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${activeCategory.slug}?sub=${sub.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded border border-slate-100 p-2 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                      >
                        <img
                          src={sub.image}
                          alt={sub.name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded object-contain bg-white shrink-0"
                        />
                        <span className="text-xs font-medium text-slate-700 line-clamp-2">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    More Mrtom shop Departments
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    {DIRECTORY_HIGHLIGHTS.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-slate-600 hover:text-[#1868b7] hover:underline"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between bg-[#1868b7] px-4 py-3 text-white">
                <OthobaLogo variant="light" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close mobile menu"
                  className="rounded p-1 hover:bg-white/15"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-center text-slate-800"
                  >
                    {user ? user.name.split(' ')[0] : 'Sign In / Account'}
                  </Link>
                  <Link
                    href="/deals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-rose-50 border border-rose-200 px-3 py-2 text-center text-[#d91b24]"
                  >
                    Hot Deals
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-blue-50 border border-blue-200 px-3 py-2 text-center text-[#1868b7]"
                  >
                    Track Order
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-center text-slate-700"
                  >
                    Wishlist ({wishlistIds.length})
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-center text-slate-700"
                  >
                    Compare ({compareIds.length})
                  </Link>
                  <Link
                    href="/sell-on-othoba"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-center text-slate-700"
                  >
                    Sell on Mrtom shop
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                    All Categories ({CATEGORIES.length})
                  </p>
                  <div className="divide-y divide-slate-100">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-slate-800 hover:text-[#1868b7]"
                      >
                        {cat.menuIcon && (
                          <img
                            src={cat.menuIcon}
                            alt=""
                            className="h-5 w-5 rounded object-contain shrink-0"
                          />
                        )}
                        <span className="flex-1 truncate">{cat.name}</span>
                        <ChevronRight size={15} className="text-slate-400 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
