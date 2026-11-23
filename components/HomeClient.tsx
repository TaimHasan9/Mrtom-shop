'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  OTHOBA_HERO_SLIDES,
  OTHOBA_PROMO_2COL,
  OTHOBA_PROMO_3COL,
  OTHOBA_SIDE_BOTTOM_BANNERS,
  OTHOBA_SIDE_TOP_BANNERS,
  OTHOBA_STATIC,
} from '@/lib/catalog/othoba-assets';
import type { Category, Product, Vendor } from '@/lib/types';
import ProductCard from './ProductCard';
import { useStore } from './StoreProvider';

interface HomeClientProps {
  categories: Category[];
  vendors: Vendor[];
  totalCatalogCount: number;
  hotDealsFeatured: Product[];
  hotDealsCompact: Product[];
  trendingProducts: Product[];
  featuredProducts: Product[];
  newArrivalProducts: Product[];
  topRatedProducts: Product[];
  bestSellerProducts: Product[];
}

type RecommendedTab = 'featured' | 'new-arrival' | 'top-rated' | 'best-seller';

export default function HomeClient({
  categories,
  vendors,
  totalCatalogCount,
  hotDealsFeatured,
  hotDealsCompact,
  trendingProducts,
  featuredProducts,
  newArrivalProducts,
  topRatedProducts,
  bestSellerProducts,
}: HomeClientProps) {
  const { setAppDealsOpen } = useStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);
  const [trendingOffset, setTrendingOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<RecommendedTab>('featured');
  const [brandPage, setBrandPage] = useState(0);
  const [dealSecondsLeft, setDealSecondsLeft] = useState(14 * 3600 + 38 * 60 + 25);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % OTHOBA_HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setDealSecondsLeft((prev) => (prev > 0 ? prev - 1 : 23 * 3600 + 59 * 60 + 59));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const dealHours = String(Math.floor(dealSecondsLeft / 3600)).padStart(2, '0');
  const dealMinutes = String(Math.floor((dealSecondsLeft % 3600) / 60)).padStart(2, '0');
  const dealSecs = String(dealSecondsLeft % 60).padStart(2, '0');

  const homeCircleCats = categories.filter((c) => c.featuredOnHome).slice(0, 11);
  const extraCats = categories.filter((c) => !c.featuredOnHome);

  const visibleTrending = (() => {
    if (trendingProducts.length <= 5) return trendingProducts;
    const out: Product[] = [];
    for (let i = 0; i < 5; i++) {
      out.push(trendingProducts[(trendingOffset + i) % trendingProducts.length]);
    }
    return out;
  })();

  const recommendedList =
    activeTab === 'featured'
      ? featuredProducts
      : activeTab === 'new-arrival'
      ? newArrivalProducts
      : activeTab === 'top-rated'
      ? topRatedProducts
      : bestSellerProducts;

  const totalBrandPages = Math.max(1, Math.ceil(vendors.length / 4));
  const visibleBrands = vendors.slice(brandPage * 4, brandPage * 4 + 4);
  const activeSlide = OTHOBA_HERO_SLIDES[slideIdx];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1360px] px-3 sm:px-6 pt-3 pb-6 space-y-6 sm:space-y-7">
        {/* 1. Top 11 Circular Category Strip (matches othoba-home-clean.png & othoba-mobile.png) */}
        <section aria-label="Featured Categories">
          <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-1 no-scrollbar lg:grid lg:grid-cols-11 lg:overflow-visible">
            {homeCircleCats.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex w-[74px] sm:w-20 lg:w-auto shrink-0 flex-col items-center text-center"
              >
                <div
                  className={`flex h-16 w-16 sm:h-[78px] sm:w-[78px] items-center justify-center rounded-full p-2 transition-transform duration-200 group-hover:scale-105 ${
                    cat.slug === 'diapers-baby'
                      ? 'bg-[radial-gradient(circle_at_35%_30%,#f3e8ff_0%,#d8b4fe_100%)]'
                      : 'bg-[radial-gradient(circle_at_35%_30%,#eaf8ff_0%,#96dbfb_100%)]'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-full object-contain"
                  />
                </div>
                <span className="mt-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-tight text-slate-800 group-hover:text-[#1868b7] line-clamp-2 leading-tight">
                  {cat.shortLabel ?? cat.name}
                </span>
              </Link>
            ))}
          </div>

          {extraCats.length > 0 && (
            <div className="mt-2 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowAllCats((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1868b7] hover:underline"
              >
                <span>
                  {showAllCats
                    ? 'Hide Extra Departments'
                    : `Browse All ${categories.length} Categories (+${extraCats.length} More)`}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${showAllCats ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showAllCats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      {extraCats.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 py-2 hover:border-[#1868b7] hover:bg-blue-50/40 transition-colors"
                        >
                          <img
                            src={cat.menuIcon ?? cat.image}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="h-7 w-7 rounded object-contain shrink-0"
                          />
                          <span className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-tight">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* 2. 70/30 Othoba Hero Carousel + 4 Side Promotional Banners (matches othoba-home-clean.png) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Hero Slider */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="relative lg:col-span-8 aspect-[735/360] lg:aspect-auto lg:h-[404px] rounded-md overflow-hidden bg-slate-100"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0.88 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.88 }}
                transition={{ duration: 0.18 }}
                className="h-full w-full"
              >
                <Link href={activeSlide.href} className="block h-full w-full">
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.alt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-fill"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() =>
                setSlideIdx((prev) => (prev - 1 + OTHOBA_HERO_SLIDES.length) % OTHOBA_HERO_SLIDES.length)
              }
              aria-label="Previous hero banner"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSlideIdx((prev) => (prev + 1) % OTHOBA_HERO_SLIDES.length)}
              aria-label="Next hero banner"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {OTHOBA_HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Show banner slide ${idx + 1}`}
                  onClick={() => setSlideIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === slideIdx ? 'w-5 bg-[#1868b7] ring-1 ring-white' : 'w-2 bg-white/75 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: 2 Stacked Top + 2 Side-by-Side Bottom */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {OTHOBA_SIDE_TOP_BANNERS.map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.href}
                  className="group block h-[126px] sm:h-[130px] rounded-md overflow-hidden bg-slate-100"
                >
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {OTHOBA_SIDE_BOTTOM_BANNERS.map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.href}
                  className="group block h-[126px] sm:h-[120px] rounded-md overflow-hidden bg-slate-100"
                >
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3. 4-Column Bilingual Policy & Trust Strip (matches othoba-home-clean.png) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-md border border-slate-200 bg-white">
          <Link
            href="/info/returns-policy"
            className="flex items-center justify-center gap-2.5 px-3 py-3.5 hover:bg-slate-50 transition-colors text-center sm:text-left"
          >
            <RotateCcw size={20} className="text-slate-700 shrink-0" />
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">
                বাতিলকরণ, রিটার্ন এবং রিফান্ড নীতি
              </p>
            </div>
          </Link>

          <Link
            href="/info/privacy-policy"
            className="flex items-center justify-center gap-2.5 px-3 py-3.5 hover:bg-slate-50 transition-colors text-center sm:text-left"
          >
            <ShieldCheck size={20} className="text-slate-700 shrink-0" />
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">
                গোপনীয়তা নীতি
              </p>
            </div>
          </Link>

          <Link
            href="/info/emi-policy"
            className="flex items-center justify-center gap-2.5 px-3 py-3.5 hover:bg-slate-50 transition-colors text-center sm:text-left"
          >
            <CreditCard size={20} className="text-slate-700 shrink-0" />
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">
                ইএমআই নীতি
              </p>
            </div>
          </Link>

          <Link
            href="/info/help-center"
            className="flex items-center justify-center gap-2.5 px-3 py-3.5 hover:bg-slate-50 transition-colors text-center sm:text-left"
          >
            <Headphones size={20} className="text-slate-700 shrink-0" />
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">
                গ্রাহক সহায়তা
              </p>
            </div>
          </Link>
        </section>

        {/* 4. Full-Width Air Fryer Mid Campaign Strip (matches othoba-home-sec1.png) */}
        <section>
          <Link
            href="/product/philips-na231-1700w-digital-xl-air-fryer"
            className="block rounded-md overflow-hidden border border-slate-200 shadow-2xs"
          >
            <img
              src={OTHOBA_STATIC.midAirFryerBanner}
              alt="Lowest Price Ever on Philips Air Fryer"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[160px] object-cover"
            />
          </Link>
        </section>

        {/* 5. Hot Deals of the Day */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#d91b24]">
                Hot Deals of the Day
              </h2>
              <div
                aria-label="Hot deals countdown timer"
                className="inline-flex items-center gap-1.5 rounded bg-[#fff1f0] border border-[#ffd4d1] px-2.5 py-1 text-[11px] font-bold text-[#d91b24] tabular-nums"
              >
                <Clock size={12} className="shrink-0" />
                <span>Ends in</span>
                <span className="rounded bg-[#d91b24] px-1.5 py-0.5 text-white">{dealHours}</span>
                <span>:</span>
                <span className="rounded bg-[#d91b24] px-1.5 py-0.5 text-white">{dealMinutes}</span>
                <span>:</span>
                <span className="rounded bg-[#d91b24] px-1.5 py-0.5 text-white">{dealSecs}</span>
              </div>
            </div>
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-800 hover:text-[#1868b7] whitespace-nowrap"
            >
              <span>More Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Top 2 Large Blue-Bordered Featured Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hotDealsFeatured.map((product) => (
              <ProductCard key={product.id} product={product} variant="featured-horizontal" />
            ))}
          </div>

          {/* Bottom 4x2 Compact Horizontal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {hotDealsCompact.map((product) => (
              <ProductCard key={product.id} product={product} variant="compact-horizontal" />
            ))}
          </div>
        </section>

        {/* 6. 2-Column + 3-Column Promo Banners (matches othoba-home-mid.png) */}
        <section className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {OTHOBA_PROMO_2COL.map((banner) => (
              <Link
                key={banner.id}
                href={banner.href}
                className="group block rounded-md overflow-hidden bg-slate-100"
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-40 sm:h-48 lg:h-52 object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {OTHOBA_PROMO_3COL.map((banner) => (
              <Link
                key={banner.id}
                href={banner.href}
                className="group block rounded-md overflow-hidden bg-slate-100"
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-40 sm:h-44 object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* 7. Trending Products Carousel (matches othoba-home-mid.png) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Trending Products</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTrendingOffset(
                    (prev) => (prev - 1 + trendingProducts.length) % Math.max(1, trendingProducts.length)
                  )
                }
                aria-label="Previous trending products"
                className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:border-[#1868b7] hover:text-[#1868b7]"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setTrendingOffset((prev) => (prev + 1) % Math.max(1, trendingProducts.length))
                }
                aria-label="Next trending products"
                className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:border-[#1868b7] hover:text-[#1868b7]"
              >
                <ChevronRight size={15} />
              </button>
              <Link
                href="/products?sort=rating"
                className="ml-1 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-800 hover:text-[#1868b7] whitespace-nowrap"
              >
                <span>More Products</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
            {visibleTrending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 8. Recommended For You (Centered Title & Underline Tabs matching othoba-home-sec2.png) */}
        <section className="space-y-4 pt-2">
          <div className="text-center space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recommended For You</h2>
            <div
              role="tablist"
              aria-label="Recommended product collections"
              className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 border-b border-slate-200 pb-0"
            >
              {(
                [
                  { id: 'featured', label: 'Featured' },
                  { id: 'new-arrival', label: 'New Arrivals' },
                  { id: 'top-rated', label: 'Top Rated' },
                  { id: 'best-seller', label: 'Best Seller' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#1868b7] text-[#1868b7]'
                      : 'border-transparent text-slate-700 hover:text-[#1868b7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
            {recommendedList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#1868b7] bg-white px-6 py-2.5 text-xs sm:text-sm font-semibold text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
            >
              <span>Browse All {totalCatalogCount.toLocaleString()} Products</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* 9. Full-Width Purple Mobile App Download Banner */}
        <section>
          <button
            type="button"
            onClick={() => setAppDealsOpen(true)}
            aria-label="Download Mrtom shop App & Unlock App-Only Offers"
            className="w-full block rounded-md overflow-hidden shadow-2xs focus:outline-none"
          >
            <img
              src={OTHOBA_STATIC.appBanner}
              alt="Shop Smarter, Live Better - Download Mrtom shop App Now"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[190px] object-cover"
            />
          </button>
        </section>

        {/* 10. Top Weekly Brands */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Top Weekly Brands</h2>
            <Link
              href="/sell-on-othoba"
              className="text-xs sm:text-sm font-medium text-[#1868b7] hover:underline whitespace-nowrap"
            >
              Sell on Mrtom shop &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {visibleBrands.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/seller/${vendor.slug}`}
                className="group flex flex-col justify-between rounded-[4px] border border-slate-200 bg-white p-4 hover:border-[#3492db] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-slate-100 bg-white p-1 overflow-hidden">
                    {vendor.logoImage ? (
                      <img
                        src={vendor.logoImage}
                        alt={vendor.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-extrabold text-[#1868b7]">{vendor.logoText}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1868b7] truncate">
                      {vendor.name}{' '}
                      <span className="font-normal text-slate-500">
                        ({vendor.productCount} Products)
                      </span>
                    </h3>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="fill-[#f6921e] text-[#f6921e]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {vendor.sampleImages.map((img, i) => (
                    <div
                      key={i}
                      className="flex aspect-square items-center justify-center rounded bg-white p-1"
                    >
                      <img
                        src={img}
                        alt={`${vendor.name} item ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {totalBrandPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {Array.from({ length: totalBrandPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`View brand page ${idx + 1}`}
                  onClick={() => setBrandPage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    brandPage === idx ? 'w-5 bg-[#3492db]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
