'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Heart,
  Loader2,
  Minus,
  Plus,
  Scale,
  ShoppingBag,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { OTHOBA_STATIC } from '@/lib/catalog/othoba-assets';
import { formatTk } from '@/lib/store-logic';
import type { Product } from '@/lib/types';
import { useStore } from './StoreProvider';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'featured-horizontal' | 'compact-horizontal';
}

export default function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const {
    cart,
    addToCart,
    updateCartQuantity,
    toggleWishlist,
    toggleCompare,
    wishlistIds,
    compareIds,
  } = useStore();
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const [imgSrc, setImgSrc] = useState(product.image);
  const [btnPhase, setBtnPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const imgBoxRef = useRef<HTMLDivElement>(null);

  const fallbackImg = `/images/othoba/cat-${product.categorySlug}.png`;
  const defaultVariant = product.variants?.[0]?.options[0];
  const cartEntry = cart.find(
    (item) =>
      item.productId === product.id &&
      (item.selectedVariant ?? '') === (defaultVariant ?? '')
  );
  const inCartQty = cartEntry?.quantity ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnPhase === 'loading') return;

    setBtnPhase('loading');
    const sourceRect = imgBoxRef.current?.getBoundingClientRect() ?? null;
    const ok = await addToCart({
      productId: product.id,
      quantity: 1,
      selectedVariant: defaultVariant,
      openDrawer: false,
      productName: product.name,
      productImage: imgSrc,
      sourceRect,
    });

    if (ok) {
      setBtnPhase('success');
      setTimeout(() => {
        setBtnPhase('idle');
      }, 950);
    } else {
      setBtnPhase('idle');
    }
  };

  const handleStepQty = async (e: React.MouseEvent, nextQty: number) => {
    e.preventDefault();
    e.stopPropagation();
    const isInc = nextQty > inCartQty;
    const sourceRect = isInc ? imgBoxRef.current?.getBoundingClientRect() ?? null : null;
    await updateCartQuantity(
      product.id,
      nextQty,
      defaultVariant,
      isInc ? { productImage: imgSrc, sourceRect } : undefined
    );
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart({
      productId: product.id,
      quantity: 1,
      selectedVariant: defaultVariant,
      openDrawer: false,
      productName: product.name,
      productImage: imgSrc,
      sourceRect: imgBoxRef.current?.getBoundingClientRect() ?? null,
    });
    if (ok) {
      router.push('/checkout');
    }
  };

  /* 1. HOT DEALS COMPACT HORIZONTAL CARD */
  if (variant === 'compact-horizontal') {
    return (
      <div className="group flex items-center gap-3 bg-white p-2.5 rounded-[4px] border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
        <div
          ref={imgBoxRef}
          className="relative h-24 w-24 shrink-0 overflow-hidden bg-white p-1 flex items-center justify-center"
        >
          <Link
            href={`/product/${product.slug}`}
            className="flex h-full w-full items-center justify-center"
          >
            <img
              src={imgSrc}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => {
                if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
              }}
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-medium text-slate-800 hover:text-[#1868b7] line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.round(product.rating)
                    ? 'fill-[#f6921e] text-[#f6921e]'
                    : 'text-slate-300'
                }
              />
            ))}
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                {formatTk(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through tabular-nums">
                  {formatTk(product.originalPrice)}
                </span>
              )}
            </div>

            {inCartQty > 0 && btnPhase === 'idle' ? (
              <div className="inline-flex items-center rounded border border-[#1868b7] bg-blue-50/70 overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleStepQty(e, inCartQty - 1)}
                  aria-label={`Decrease quantity for ${product.name}`}
                  className="px-1.5 py-0.5 text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
                >
                  <Minus size={11} />
                </button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={inCartQty}
                    data-testid="card-qty-value"
                    initial={{ y: -6, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 6, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.12 }}
                    className="px-1.5 text-[11px] font-bold text-[#1868b7] tabular-nums"
                  >
                    {inCartQty}
                  </motion.span>
                </AnimatePresence>
                <button
                  type="button"
                  data-testid="card-qty-inc"
                  onClick={(e) => handleStepQty(e, inCartQty + 1)}
                  aria-label={`Increase quantity for ${product.name}`}
                  className="px-1.5 py-0.5 text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
                >
                  <Plus size={11} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={btnPhase === 'loading'}
                aria-label={`Add ${product.name} to cart`}
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-colors shrink-0 ${
                  btnPhase === 'success'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : btnPhase === 'loading'
                    ? 'border-[#1868b7] bg-[#1868b7] text-white'
                    : 'border-slate-300 text-slate-700 hover:border-[#1868b7] hover:bg-[#1868b7] hover:text-white'
                }`}
              >
                {btnPhase === 'loading' ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : btnPhase === 'success' ? (
                  <Check size={10} />
                ) : null}
                <span>
                  {btnPhase === 'loading' ? '...' : btnPhase === 'success' ? 'Added' : '+ Cart'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* 2. HOT DEALS FEATURED HORIZONTAL CARD */
  if (variant === 'featured-horizontal') {
    return (
      <div className="group grid grid-cols-1 sm:grid-cols-12 gap-4 rounded-[6px] border border-[#5aa7e2] bg-white p-4 sm:p-5 transition-shadow hover:shadow-md">
        <div
          ref={imgBoxRef}
          className="relative sm:col-span-6 flex items-center justify-center bg-white p-2 min-h-[220px] sm:min-h-[250px] overflow-hidden"
        >
          <Link
            href={`/product/${product.slug}`}
            className="flex h-full w-full items-center justify-center"
          >
            <img
              src={imgSrc}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => {
                if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
              }}
              className="max-h-48 sm:max-h-56 w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        <div className="sm:col-span-6 flex flex-col justify-center min-w-0">
          <Link
            href={`/product/${product.slug}`}
            className="block text-[15px] sm:text-base font-medium text-slate-900 hover:text-[#1868b7] line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
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
            <span>({product.reviewCount} Reviews)</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
              {formatTk(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through tabular-nums">
                {formatTk(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-slate-900 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 hover:bg-[#1868b7] hover:border-[#1868b7] hover:text-white transition-colors whitespace-nowrap"
            >
              <ShoppingBag size={14} />
              <span>BUY NOW</span>
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={btnPhase === 'loading'}
              aria-label={`Add ${product.name} to cart`}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[3px] px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                btnPhase === 'success'
                  ? 'bg-emerald-600 text-white'
                  : btnPhase === 'loading'
                  ? 'bg-[#1868b7] text-white'
                  : 'bg-[#1868b7]/10 text-[#1868b7] hover:bg-[#1868b7] hover:text-white'
              }`}
            >
              {btnPhase === 'loading' ? (
                <Loader2 size={13} className="animate-spin" />
              ) : btnPhase === 'success' ? (
                <Check size={13} />
              ) : (
                <ShoppingCart size={13} />
              )}
              <span>
                {btnPhase === 'loading'
                  ? 'Adding...'
                  : btnPhase === 'success'
                  ? 'Added!'
                  : inCartQty > 0
                  ? `In Cart (${inCartQty})`
                  : 'Add'}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id, product.name);
              }}
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
              className={`p-2 transition-colors ${
                isWishlisted ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-rose-500' : ''} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleCompare(product.id, product.name);
              }}
              aria-label={`Compare ${product.name}`}
              className={`p-2 transition-colors ${
                isCompared ? 'text-[#1868b7]' : 'text-slate-600 hover:text-[#1868b7]'
              }`}
            >
              <Scale size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 3. STANDARD GRID CARD */
  return (
    <div className="group flex flex-col rounded-[4px] border border-[#e5e7eb] bg-white transition-all duration-150 hover:shadow-md hover:border-[#9dc7ee] overflow-hidden">
      <div
        ref={imgBoxRef}
        className="relative aspect-square w-full bg-white p-3 overflow-hidden"
      >
        <Link
          href={`/product/${product.slug}`}
          className="flex h-full w-full items-center justify-center"
        >
          <img
            src={imgSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => {
              if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
            }}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
          />
        </Link>

        {/* Top-right Red Burst % OFF Badge */}
        {product.discountPercent > 0 && (
          <div
            className="pointer-events-none absolute right-2 top-2 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-[#e60000] text-white font-extrabold leading-none shadow-sm ring-2 ring-dashed ring-[#e60000] ring-offset-1"
            aria-label={`${product.discountPercent}% OFF`}
          >
            <span className="text-[11px] tabular-nums">{product.discountPercent}%</span>
            <span className="text-[8px] tracking-tight">OFF</span>
          </div>
        )}

        {/* Bottom-right Compare icon button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleCompare(product.id, product.name);
          }}
          aria-label={`Compare ${product.name}`}
          className={`absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full border shadow-2xs transition-colors ${
            isCompared
              ? 'border-[#1868b7] bg-blue-50 text-[#1868b7]'
              : 'border-slate-200 bg-white/95 text-slate-500 hover:text-[#1868b7]'
          }`}
        >
          <Scale size={14} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1.5">
        {/* Title + inline COLLECTION POINT + right Heart icon */}
        <div className="flex items-start justify-between gap-1.5">
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-[13px] font-normal text-slate-800 hover:text-[#1868b7] line-clamp-2 min-h-[2.3rem] leading-snug flex-1"
          >
            {product.collectionPoint && (
              <img
                src={OTHOBA_STATIC.collectionPointSvg}
                alt="Collection Point"
                className="inline-block h-3.5 w-auto mr-1 align-text-bottom"
              />
            )}
            <span>{product.name}</span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id, product.name);
            }}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`mt-0.5 shrink-0 transition-colors ${
              isWishlisted ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart size={15} className={isWishlisted ? 'fill-rose-500' : ''} />
          </button>
        </div>

        {/* Rating & Sold Row */}
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          {product.soldCount > 20 ? (
            <>
              <span className="inline-flex items-center gap-0.5 rounded-[2px] bg-[#1b8a3d] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                {product.rating.toFixed(1)}
                <Star size={9} className="fill-white text-white" />
              </span>
              <span>({product.reviewCount})</span>
              <span className="text-slate-300">|</span>
              <span className="truncate">{product.soldCount.toLocaleString()} Sold</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={
                      i < Math.round(product.rating)
                        ? 'fill-[#f6921e] text-[#f6921e]'
                        : 'text-slate-300'
                    }
                  />
                ))}
              </div>
              <span>({product.reviewCount} Reviews)</span>
            </>
          )}
        </div>

        {/* Price + Animated Cart / Quantity Controls */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-[15px] font-bold text-slate-900 tabular-nums">
              {formatTk(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatTk(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-2 h-8">
            <AnimatePresence mode="wait" initial={false}>
              {btnPhase !== 'idle' || inCartQty === 0 ? (
                <motion.button
                  key={`add-btn-${btnPhase}`}
                  type="button"
                  onClick={handleAddToCart}
                  disabled={btnPhase === 'loading'}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0.85, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.8, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  data-testid="card-add-to-cart"
                  className={`flex h-full w-full items-center justify-center gap-1.5 rounded-[3px] border text-[11px] font-semibold transition-colors ${
                    btnPhase === 'success'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : btnPhase === 'loading'
                      ? 'border-[#1868b7] bg-[#1868b7] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#1868b7] hover:bg-[#1868b7] hover:text-white'
                  }`}
                >
                  {btnPhase === 'loading' ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : btnPhase === 'success' ? (
                    <>
                      <Check size={13} strokeWidth={2.6} />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={12} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="qty-stepper"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  data-testid="card-qty-stepper"
                  className="flex h-full w-full items-center justify-between overflow-hidden rounded-[3px] border border-[#1868b7] bg-blue-50/80"
                >
                  <button
                    type="button"
                    onClick={(e) => handleStepQty(e, inCartQty - 1)}
                    aria-label={`Decrease quantity for ${product.name}`}
                    className="flex h-full w-8 items-center justify-center text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#1868b7]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={inCartQty}
                        data-testid="card-qty-value"
                        initial={{ y: -8, opacity: 0, scale: 0.85 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.12 }}
                        className="tabular-nums font-extrabold"
                      >
                        {inCartQty}
                      </motion.span>
                    </AnimatePresence>
                    <span className="font-semibold text-slate-600">in cart</span>
                  </div>
                  <button
                    type="button"
                    data-testid="card-qty-inc"
                    onClick={(e) => handleStepQty(e, inCartQty + 1)}
                    aria-label={`Increase quantity for ${product.name}`}
                    className="flex h-full w-8 items-center justify-center text-[#1868b7] hover:bg-[#1868b7] hover:text-white transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
