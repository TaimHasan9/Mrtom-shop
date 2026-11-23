'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  PhoneCall,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { OTHOBA_STATIC } from '@/lib/catalog/othoba-assets';
import { calculateEmiMonthly, DELIVERY_AREAS, formatTk } from '@/lib/store-logic';
import type { DeliveryAreaId, Product, Vendor } from '@/lib/types';
import ProductCard from './ProductCard';
import { useStore } from './StoreProvider';

interface ProductDetailClientProps {
  initialProduct: Product;
  vendor?: Vendor;
  relatedProducts: Product[];
  alsoBoughtProducts: Product[];
}

type TabKey = 'description' | 'specs' | 'vendor' | 'reviews' | 'qa';

export default function ProductDetailClient({
  initialProduct,
  vendor,
  relatedProducts,
  alsoBoughtProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const {
    cart,
    areaId,
    setDeliveryArea,
    addToCart,
    toggleWishlist,
    toggleCompare,
    wishlistIds,
    compareIds,
    setEmiModalProduct,
    setAppDealsOpen,
    showToast,
  } = useStore();

  const [product, setProduct] = useState<Product>(initialProduct);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const [selectedImage, setSelectedImage] = useState(gallery[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants?.[0]?.options[0] ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [availEmi, setAvailEmi] = useState(false);
  const [changingArea, setChangingArea] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [addPhase, setAddPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [copiedLink, setCopiedLink] = useState(false);

  const mainImageRef = useRef<HTMLButtonElement>(null);

  // Review Form State
  const [revAuthor, setRevAuthor] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revError, setRevError] = useState<string | null>(null);

  // Question Form State
  const [qaAuthor, setQaAuthor] = useState('');
  const [qaText, setQaText] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const currentArea = DELIVERY_AREAS.find((a) => a.id === areaId) ?? DELIVERY_AREAS[0];
  const effectiveDeliveryFee =
    product.freeDelivery || product.price * quantity >= 3000 ? 0 : currentArea.fee;

  const emiMonths = product.emiMonths ?? 3;
  const emiPerMonth = calculateEmiMonthly(product.price, emiMonths);
  const savingsAmount = Math.max(0, product.originalPrice - product.price);

  const inCartEntry = cart.find(
    (item) =>
      item.productId === product.id &&
      (item.selectedVariant ?? '') === (selectedVariant ?? '')
  );

  // Rating breakdown histogram for Reviews tab (matches live Othoba.com PDP)
  const ratingBreakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of product.reviews) {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] ?? 0) + 1;
    }
    const totalReviews = product.reviews.length;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars] ?? 0;
      const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 80 : 0;
      return { stars, count, percent };
    });
  }, [product.reviews]);

  const handleAddToCart = async () => {
    if (addPhase === 'loading') return;
    setAddPhase('loading');
    const sourceRect = mainImageRef.current?.getBoundingClientRect() ?? null;
    const ok = await addToCart({
      productId: product.id,
      quantity,
      selectedVariant: selectedVariant || undefined,
      availEmi,
      openDrawer: false,
      productName: product.name,
      productImage: selectedImage,
      sourceRect,
    });
    if (ok) {
      setAddPhase('success');
      setTimeout(() => {
        setAddPhase('idle');
      }, 1200);
    } else {
      setAddPhase('idle');
    }
  };

  const handleBuyNow = async () => {
    const sourceRect = mainImageRef.current?.getBoundingClientRect() ?? null;
    const ok = await addToCart({
      productId: product.id,
      quantity,
      selectedVariant: selectedVariant || undefined,
      availEmi,
      openDrawer: false,
      productName: product.name,
      productImage: selectedImage,
      sourceRect,
    });
    if (ok) {
      router.push('/checkout');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
    }
    setCopiedLink(true);
    showToast('Product link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevError(null);
    setRevSubmitting(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: revAuthor, rating: revRating, comment: revComment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevError(data.error ?? 'Could not submit review.');
        return;
      }
      if (data.product) setProduct(data.product);
      setRevAuthor('');
      setRevComment('');
      setRevRating(5);
      showToast('Thank you! Your review has been published.');
    } finally {
      setRevSubmitting(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQaError(null);
    setQaSubmitting(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.slug)}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: qaAuthor, question: qaText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQaError(data.error ?? 'Could not submit question.');
        return;
      }
      if (data.product) setProduct(data.product);
      setQaAuthor('');
      setQaText('');
      showToast('Your question has been answered by the seller!');
    } finally {
      setQaSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-4 space-y-5">
        {/* Breadcrumbs matching live Othoba PDP */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 border-b border-slate-100 pb-2.5"
        >
          <Link href="/" className="hover:text-[#1868b7]">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-[#1868b7]">
            {product.categoryName}
          </Link>
          <ChevronRight size={13} />
          <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
        </nav>

        {/* Outer 2-Zone Othoba PDP Grid: Left 9-col main flow (Summary + Tabs + Related + Also Bought) & Right 3-col Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 9 COLUMNS */}
          <div className="lg:col-span-9 space-y-8 min-w-0">
            {/* Upper Gallery + Core Product Details */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Gallery (5 of 12) */}
              <div className="md:col-span-5 space-y-3">
                <button
                  ref={mainImageRef}
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Zoom product image"
                  className="group relative flex aspect-square w-full items-center justify-center rounded border border-slate-200 bg-white p-4 overflow-hidden"
                >
                  {product.discountPercent > 0 && (
                    <span className="absolute left-3 top-3 z-10 rounded bg-[#f26522] px-2 py-0.5 text-[11px] font-bold text-white">
                      -{product.discountPercent}%
                    </span>
                  )}

                  <img
                    src={selectedImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />

                  <span className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-[#1868b7] group-hover:text-white transition-colors">
                    <ZoomIn size={16} />
                  </span>
                </button>

                {gallery.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        aria-label={`View thumbnail ${idx + 1}`}
                        className={`h-16 w-16 shrink-0 rounded border p-1 bg-white transition-all ${
                          selectedImage === imgUrl
                            ? 'border-[#1868b7] ring-1 ring-[#1868b7]'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} view ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Core Info & Purchase Controls (7 of 12) */}
              <div className="md:col-span-7 flex flex-col space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 leading-snug">
                      {product.name}
                    </h1>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share product link"
                      title="Copy product link"
                      className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                        copiedLink
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#1868b7] hover:text-[#1868b7]'
                      }`}
                    >
                      {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                    </button>
                  </div>

                  {/* Brand Box + Metadata Block */}
                  <div className="mt-3 flex items-center gap-4 border-b border-slate-100 pb-3.5">
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 px-2 text-center">
                      <span className="text-xs font-extrabold uppercase tracking-tight text-[#1868b7]">
                        {product.brand}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-500">
                      <p>
                        Category:{' '}
                        <Link
                          href={`/category/${product.categorySlug}`}
                          className="text-slate-700 hover:text-[#1868b7]"
                        >
                          {product.categoryName}
                        </Link>
                      </p>
                      <p>SKU: {product.sku}</p>
                      <p>Brand: {product.brand}</p>
                      <p>
                        Seller:{' '}
                        <Link
                          href={`/seller/${product.sellerSlug}`}
                          className="text-[#1868b7] font-semibold hover:underline"
                        >
                          {product.sellerName}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing + Stock + Rating Block */}
                <div className="space-y-2.5 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tabular-nums">
                      {formatTk(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-base text-slate-400 line-through tabular-nums">
                        {formatTk(product.originalPrice)}
                      </span>
                    )}
                    {product.discountPercent > 0 && (
                      <span className="text-xs font-bold text-[#1868b7]">
                        {product.discountPercent}% OFF
                      </span>
                    )}
                    {savingsAmount > 0 && (
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 tabular-nums">
                        Save {formatTk(savingsAmount)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < Math.round(product.rating)
                              ? 'fill-[#f6921e] text-[#f6921e]'
                              : 'text-slate-300'
                          }
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('reviews');
                        document
                          .getElementById('pdp-details-tabs')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-slate-600 hover:text-[#1868b7] font-medium"
                    >
                      {product.reviewCount} Review(s)
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{product.soldCount.toLocaleString()} Sold</span>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 size={12} />
                      In Stock ({product.stockCount} available)
                    </span>
                  </div>

                  {/* Peachy APP-ONLY PRICE Card */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f8d7c7] bg-[#fff5f0] px-4 py-3 shadow-2xs">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        APP-ONLY PRICE
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-[#ef4444] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                          APP
                        </span>
                        <span className="text-xl font-extrabold text-[#e85022] tabular-nums">
                          {formatTk(product.appPrice)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">Available in the Mrtom shop app</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppDealsOpen(true)}
                      className="inline-flex items-center gap-2 rounded-md bg-[#e85022] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#cf4217] transition-colors"
                    >
                      <Download size={14} />
                      <span>Download App</span>
                    </button>
                  </div>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div key={variant.label}>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">
                          {variant.label}: <span className="text-[#1868b7]">{selectedVariant}</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSelectedVariant(opt)}
                              className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                                selectedVariant === opt
                                  ? 'border-[#1868b7] bg-blue-50 text-[#1868b7] font-bold'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-[#1868b7]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Animated Quantity Stepper + ADD TO CART (Loading/Success/Fly) + Heart + Compare */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex h-11 items-center rounded-[3px] border border-slate-300 bg-white px-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        <Minus size={13} />
                      </button>
                      <div className="relative w-10 h-6 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={quantity}
                            data-testid="pdp-quantity"
                            initial={{ y: 8, opacity: 0, scale: 0.85 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -8, opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.1 }}
                            className="text-sm font-bold tabular-nums text-slate-900"
                          >
                            {quantity}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addPhase === 'loading'}
                      data-testid="pdp-add-to-cart"
                      className={`flex-1 min-w-[165px] h-11 inline-flex items-center justify-center gap-2 rounded-[3px] px-5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white transition-all active:scale-[0.99] ${
                        addPhase === 'success'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-[#2c78c6] hover:bg-[#1868b7]'
                      }`}
                    >
                      {addPhase === 'loading' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>ADDING...</span>
                        </>
                      ) : addPhase === 'success' ? (
                        <>
                          <Check size={17} />
                          <span>ADDED TO CART!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>
                            ADD TO CART
                            {inCartEntry ? ` (${inCartEntry.quantity} in cart)` : ''}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id, product.name)}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`flex h-11 w-11 items-center justify-center rounded-[3px] border transition-colors ${
                        isWishlisted
                          ? 'border-rose-500 bg-rose-50 text-rose-600'
                          : 'border-slate-300 text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      <Heart size={18} className={isWishlisted ? 'fill-rose-500' : ''} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id, product.name)}
                      aria-label="Add to compare"
                      className={`flex h-11 w-11 items-center justify-center rounded-[3px] border transition-colors ${
                        isCompared
                          ? 'border-[#1868b7] bg-blue-50 text-[#1868b7]'
                          : 'border-slate-300 text-slate-600 hover:text-[#1868b7]'
                      }`}
                    >
                      <Scale size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full h-10 rounded-[3px] border border-[#f26522] bg-[#f26522] text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-[#d95516] transition-colors"
                  >
                    Buy Now — Express Checkout
                  </button>
                </div>

                {/* Avail EMI Offer + View Plans + Hotline */}
                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availEmi}
                        onChange={(e) => setAvailEmi(e.target.checked)}
                      />
                      <span>Avail EMI Offer</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmiModalProduct(product)}
                      className="font-semibold text-[#1868b7] hover:underline"
                    >
                      View Plans
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    EMI starts from <strong className="tabular-nums">{formatTk(emiPerMonth)}/months</strong>
                  </p>

                  <a
                    href="tel:09613800800"
                    className="inline-flex items-center gap-2 pt-2 text-sm font-bold text-slate-900 hover:text-[#1868b7]"
                  >
                    <PhoneCall size={18} />
                    <span>Call For Order : 09613-800800</span>
                  </a>
                </div>
              </div>
            </section>

            {/* 5-Tab Details Card (inside 9-col main flow just like live Othoba PDP) */}
            <section
              id="pdp-details-tabs"
              className="rounded border border-slate-200 bg-white overflow-hidden"
            >
              <div
                role="tablist"
                aria-label="Product details tabs"
                className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 no-scrollbar"
              >
                {(
                  [
                    { id: 'description', label: 'Description' },
                    { id: 'specs', label: 'Specification' },
                    { id: 'vendor', label: 'Vendor Info' },
                    { id: 'reviews', label: `Customer Reviews (${product.reviewCount})` },
                    { id: 'qa', label: `Question & Answer (${product.questions.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#1868b7] bg-white text-[#1868b7]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                {activeTab === 'description' && (
                  <div className="space-y-4 text-sm text-slate-700 leading-relaxed max-w-4xl">
                    <h2 className="text-base font-bold text-slate-900">Product Overview</h2>
                    <p>{product.description}</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                      <li>100% authentic product sourced from {product.brand} official supply chain.</li>
                      <li>Checked prior to dispatch by {product.sellerName} quality team.</li>
                      <li>Eligible for Cash on Delivery, bKash, Nagad, and Card payments nationwide.</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="max-w-3xl">
                    <h2 className="text-base font-bold text-slate-900 mb-3">
                      Technical Specifications
                    </h2>
                    <table className="w-full text-xs sm:text-sm border border-slate-200 rounded overflow-hidden">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-slate-50">
                          <th className="w-1/3 px-4 py-2.5 text-left font-semibold text-slate-700">
                            Brand
                          </th>
                          <td className="px-4 py-2.5 text-slate-800">{product.brand}</td>
                        </tr>
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">SKU</th>
                          <td className="px-4 py-2.5 text-slate-800">{product.sku}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                            Category
                          </th>
                          <td className="px-4 py-2.5 text-slate-800">
                            {product.categoryName} &rsaquo; {product.subcategoryName}
                          </td>
                        </tr>
                        {product.specs.map((spec, i) => (
                          <tr key={spec.label} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                              {spec.label}
                            </th>
                            <td className="px-4 py-2.5 text-slate-800">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'vendor' && (
                  <div className="max-w-2xl space-y-3 text-sm text-slate-700">
                    <h2 className="text-base font-bold text-slate-900">{product.sellerName}</h2>
                    <p>{vendor?.tagline ?? 'Verified Mrtom shop marketplace merchant.'}</p>
                    <p className="text-xs text-slate-500">
                      Location: {vendor?.location ?? 'Dhaka, Bangladesh'} ·{' '}
                      {vendor?.shipOnTime ?? 98}% On-Time Fulfillment
                    </p>
                    <Link
                      href={`/seller/${product.sellerSlug}`}
                      className="inline-block rounded bg-[#1868b7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125293]"
                    >
                      Browse All Products From This Seller
                    </Link>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Rating Summary & Breakdown Histogram (matches live Othoba PDP) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0">
                        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                          {product.rating.toFixed(1)}
                          <span className="text-sm font-medium text-slate-400"> / 5.0</span>
                        </p>
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={15}
                              className={
                                i < Math.round(product.rating)
                                  ? 'fill-[#f6921e] text-[#f6921e]'
                                  : 'text-slate-300'
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.reviewCount} Verified Review(s)
                        </p>
                      </div>

                      <div className="md:col-span-8 space-y-1.5 justify-center flex flex-col">
                        {ratingBreakdown.map((row) => (
                          <div key={row.stars} className="flex items-center gap-2.5 text-xs">
                            <span className="w-10 shrink-0 font-semibold text-slate-700 tabular-nums">
                              {row.stars} Star
                            </span>
                            <div className="h-2.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#f6921e]"
                                style={{ width: `${row.percent}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-slate-500 tabular-nums">
                              {row.percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-7 space-y-4">
                        <h2 className="text-base font-bold text-slate-900">
                          Verified Customer Reviews ({product.reviews.length})
                        </h2>
                        <div className="divide-y divide-slate-100">
                          {product.reviews.map((rev) => (
                            <div key={rev.id} className="py-3.5 first:pt-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900">
                                    {rev.author}
                                  </span>
                                  {rev.verifiedPurchase && (
                                    <span className="text-[11px] font-semibold text-emerald-700">
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400">{rev.createdAt}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={13}
                                    className={
                                      i < rev.rating
                                        ? 'fill-[#f6921e] text-[#f6921e]'
                                        : 'text-slate-300'
                                    }
                                  />
                                ))}
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 pt-1">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form
                        onSubmit={handleReviewSubmit}
                        className="lg:col-span-5 rounded border border-slate-200 bg-slate-50 p-4 space-y-3 self-start"
                      >
                        <h3 className="text-sm font-bold text-slate-900">Write a Customer Review</h3>
                        {revError && (
                          <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                            {revError}
                          </p>
                        )}
                        <div>
                          <label
                            htmlFor="rev-author"
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Your Name
                          </label>
                          <input
                            id="rev-author"
                            type="text"
                            required
                            value={revAuthor}
                            onChange={(e) => setRevAuthor(e.target.value)}
                            placeholder="e.g. Nusrat Jahan"
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#1868b7] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="rev-rating"
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Rating
                          </label>
                          <select
                            id="rev-rating"
                            value={revRating}
                            onChange={(e) => setRevRating(Number(e.target.value))}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#1868b7] focus:outline-none"
                          >
                            <option value={5}>5 Stars — Excellent</option>
                            <option value={4}>4 Stars — Very Good</option>
                            <option value={3}>3 Stars — Average</option>
                            <option value={2}>2 Stars — Fair</option>
                            <option value={1}>1 Star — Poor</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="rev-comment"
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Review Comment
                          </label>
                          <textarea
                            id="rev-comment"
                            required
                            rows={3}
                            value={revComment}
                            onChange={(e) => setRevComment(e.target.value)}
                            placeholder="Share quality, delivery experience, or value..."
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#1868b7] focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={revSubmitting}
                          className="w-full rounded bg-[#1868b7] py-2 text-xs font-bold text-white hover:bg-[#125293] transition-colors"
                        >
                          {revSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-4">
                      <h2 className="text-base font-bold text-slate-900">
                        Questions About This Product ({product.questions.length})
                      </h2>
                      <div className="divide-y divide-slate-100">
                        {product.questions.map((qa) => (
                          <div key={qa.id} className="py-3.5 first:pt-0 space-y-1.5">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                              <MessageSquare size={15} className="text-[#1868b7] shrink-0 mt-0.5" />
                              <span>Q: {qa.question}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700 pl-6">
                              <strong className="text-emerald-700">A:</strong> {qa.answer}
                            </p>
                            <p className="text-[11px] text-slate-400 pl-6">
                              Asked by {qa.author} · {qa.createdAt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={handleQuestionSubmit}
                      className="lg:col-span-5 rounded border border-slate-200 bg-slate-50 p-4 space-y-3 self-start"
                    >
                      <h3 className="text-sm font-bold text-slate-900">Ask the Seller a Question</h3>
                      {qaError && (
                        <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                          {qaError}
                        </p>
                      )}
                      <div>
                        <label
                          htmlFor="qa-author"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Your Name
                        </label>
                        <input
                          id="qa-author"
                          type="text"
                          required
                          value={qaAuthor}
                          onChange={(e) => setQaAuthor(e.target.value)}
                          placeholder="e.g. Mahmudul Hasan"
                          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#1868b7] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="qa-question"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Your Question
                        </label>
                        <textarea
                          id="qa-question"
                          required
                          rows={3}
                          value={qaText}
                          onChange={(e) => setQaText(e.target.value)}
                          placeholder="Ask about warranty, dimensions, compatibility, or delivery..."
                          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#1868b7] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={qaSubmitting}
                        className="w-full rounded bg-[#1868b7] py-2 text-xs font-bold text-white hover:bg-[#125293] transition-colors"
                      >
                        {qaSubmitting ? 'Sending...' : 'Ask Question'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Related Products</h2>
                  <Link
                    href={`/category/${product.categorySlug}`}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-[#1868b7]"
                  >
                    <span>More Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
                  {relatedProducts.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Customers Who Bought This Item Also Bought (matches live Othoba PDP lower band) */}
            {alsoBoughtProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Customers Who Bought This Item Also Bought
                  </h2>
                  <Link
                    href="/products?sort=bestseller"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-[#1868b7]"
                  >
                    <span>More Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
                  {alsoBoughtProducts.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT 3 COLUMNS: Sticky Delivery, Return & Warranty, Sold By (5-bar chart), and App QR Card */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-4">
            {/* Delivery Options */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-500">Delivery Options</h2>

              <div className="flex items-start gap-2 text-slate-800">
                <MapPin size={15} className="text-[#1868b7] shrink-0 mt-0.5" />
                <p className="font-semibold leading-snug">
                  Available Delivery Area: All over the Bangladesh.
                </p>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>{currentArea.division}</span>
                    <MapPin size={13} className="text-slate-600" />
                    <span>{currentArea.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangingArea((prev) => !prev)}
                    className="text-[11px] font-bold text-[#1868b7] hover:underline uppercase"
                  >
                    {changingArea ? 'DONE' : 'CHANGE'}
                  </button>
                </div>
                {changingArea && (
                  <select
                    id="pdp-delivery-area"
                    aria-label="Select Delivery Area"
                    value={areaId}
                    onChange={(e) => {
                      setDeliveryArea(e.target.value as DeliveryAreaId);
                      setChangingArea(false);
                    }}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:border-[#1868b7] focus:outline-none"
                  >
                    {DELIVERY_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.division} — {area.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-start gap-2 border-t border-slate-100 pt-2.5 text-slate-700">
                <Truck size={15} className="text-[#1868b7] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Delivery Info</p>
                  <p className="text-slate-500">Delivery Time : {currentArea.eta}</p>
                  <p className="text-slate-500">
                    Shipping Charge :{' '}
                    <strong className="text-slate-800">
                      {effectiveDeliveryFee === 0 ? 'Free Shipping' : formatTk(effectiveDeliveryFee)}
                    </strong>
                  </p>
                </div>
              </div>

              {product.collectionPoint && (
                <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 text-slate-800 font-semibold">
                  <MapPin size={15} className="text-[#1868b7] shrink-0" />
                  <span>Collection Point Available</span>
                </div>
              )}

              <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 text-slate-800 font-semibold">
                <Banknote size={15} className="text-[#1868b7] shrink-0" />
                <span>
                  {product.codAvailable ? 'Cash on Delivery Available' : 'Online Payment Only'}
                </span>
              </div>

              <div className="pt-1">
                <img
                  src={OTHOBA_STATIC.paymentStrip}
                  alt="bKash, VISA, Mastercard, Amex, Nagad, Upay"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>

            {/* Return & Warranty */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
              <h2 className="text-sm font-bold text-slate-500">Return &amp; Warranty</h2>
              <ul className="space-y-1 text-slate-800 font-medium list-disc pl-4">
                <li>Cancellation, Return &amp; Refund</li>
                <li>Change of mind is not applicable</li>
              </ul>
              <div className="flex items-start gap-2 border-t border-slate-100 pt-2.5 text-slate-800 font-semibold">
                <ShieldCheck size={15} className="text-[#1868b7] shrink-0 mt-0.5" />
                <span>{product.warranty ?? 'Warranty Available'}</span>
              </div>
            </div>

            {/* Sold By Card with 5-Bar Seller Size Chart */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">
                  Sold By{' '}
                  <Link
                    href={`/seller/${product.sellerSlug}`}
                    className="font-bold text-[#1868b7] hover:underline"
                  >
                    {product.sellerName}
                  </Link>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-center">
                <div>
                  <p className="text-[11px] text-slate-500 leading-tight">Positive Seller Ratings</p>
                  <p className="mt-1 text-lg font-light text-slate-500 tabular-nums">
                    {vendor ? `${Math.round(vendor.rating * 20)}%` : '98%'}
                  </p>
                </div>
                <div className="border-l border-slate-100 pl-1">
                  <p className="text-[11px] text-slate-500 leading-tight">Ship On Time</p>
                  <p className="mt-1 text-lg font-light text-slate-500 tabular-nums">
                    {vendor ? `${vendor.shipOnTime}%` : '100%'}
                  </p>
                </div>
                <div className="border-l border-slate-100 pl-1 flex flex-col items-center justify-between">
                  <p className="text-[11px] text-slate-500 leading-tight">Seller Size</p>
                  <div className="mt-2 flex items-end gap-0.5 h-5" aria-label="Seller size indicator">
                    <span className="w-1.5 h-1.5 bg-[#1868b7] rounded-2xs" />
                    <span className="w-1.5 h-2.5 bg-[#1868b7] rounded-2xs" />
                    <span className="w-1.5 h-3 bg-[#1868b7] rounded-2xs" />
                    <span className="w-1.5 h-4 bg-[#1868b7] rounded-2xs" />
                    <span className="w-1.5 h-5 bg-slate-200 rounded-2xs" />
                  </div>
                </div>
              </div>

              <Link
                href={`/seller/${product.sellerSlug}`}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-[#1868b7] py-2 text-xs font-bold uppercase text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
              >
                <Store size={14} />
                <span>Go To Store</span>
              </Link>
            </div>

            {/* Download the App QR Sidebar Card (matches live Othoba PDP right sidebar) */}
            <div className="rounded border border-slate-200 bg-white p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Smartphone size={15} className="text-[#e85022]" />
                <h2 className="text-sm font-bold text-slate-800">Download the App</h2>
              </div>
              <div className="flex items-center gap-3 rounded bg-slate-50 p-2.5 border border-slate-100">
                <img
                  src={OTHOBA_STATIC.appQr}
                  alt="Scan QR to download Mrtom shop App"
                  className="h-16 w-16 shrink-0 rounded bg-white p-0.5 object-contain border border-slate-200"
                />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 leading-tight">
                    Scan QR for App Deals
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Extra savings on {product.brand} products in the Mrtom shop app.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAppDealsOpen(true)}
                  className="rounded border border-slate-200 bg-white p-1.5 hover:border-[#1868b7] transition-colors flex items-center justify-center"
                >
                  <img
                    src={OTHOBA_STATIC.googlePlayBtn}
                    alt="Get Mrtom shop on Google Play"
                    className="h-6 w-auto object-contain"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setAppDealsOpen(true)}
                  className="rounded border border-slate-200 bg-white p-1.5 hover:border-[#1868b7] transition-colors flex items-center justify-center"
                >
                  <img
                    src={OTHOBA_STATIC.appStoreBtn}
                    alt="Download Mrtom shop on App Store"
                    className="h-6 w-auto object-contain"
                  />
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Gallery Lightbox Modal */}
        <AnimatePresence>
          {lightboxOpen && (
            <div
              className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Product image zoom preview"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-2xl w-full rounded-lg bg-white p-6"
              >
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close zoom preview"
                  className="absolute right-3 top-3 rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
                <div className="aspect-square max-h-[70vh] w-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
