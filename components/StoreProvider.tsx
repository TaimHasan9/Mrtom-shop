'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, ShoppingBag, X } from 'lucide-react';
import type { CartTotals } from '@/lib/store-logic';
import type { CartItem, DeliveryAreaId, Order, Product, UserProfile } from '@/lib/types';

export interface FlySourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  startSize: number;
  endX: number;
  endY: number;
}

interface ToastMessage {
  id: string;
  text: string;
  title?: string;
  type: 'success' | 'info' | 'error';
  image?: string;
  showCartAction?: boolean;
}

interface StoreContextValue {
  cart: CartItem[];
  totals: CartTotals;
  areaId: DeliveryAreaId;
  couponCode: string;
  wishlistIds: string[];
  wishlistProducts: Product[];
  compareIds: string[];
  compareProducts: Product[];
  user: UserProfile | null;
  userOrders: Order[];
  cartOpen: boolean;
  appDealsOpen: boolean;
  emiModalProduct: Product | null;
  loadingCart: boolean;
  cartPulseTick: number;
  setCartOpen: (open: boolean) => void;
  setAppDealsOpen: (open: boolean) => void;
  setEmiModalProduct: (product: Product | null) => void;
  launchFlyToCart: (imageUrl?: string, sourceRect?: FlySourceRect | DOMRect | null) => void;
  addToCart: (input: {
    productId: string;
    quantity?: number;
    selectedVariant?: string;
    availEmi?: boolean;
    openDrawer?: boolean;
    productName?: string;
    productImage?: string;
    sourceRect?: FlySourceRect | DOMRect | null;
  }) => Promise<boolean>;
  updateCartQuantity: (
    productId: string,
    quantity: number,
    selectedVariant?: string,
    animateOptions?: { productImage?: string; sourceRect?: FlySourceRect | DOMRect | null }
  ) => Promise<void>;
  removeFromCart: (productId: string, selectedVariant?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setDeliveryArea: (areaId: DeliveryAreaId) => Promise<void>;
  applyCoupon: (code: string) => Promise<CartTotals>;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  toggleCompare: (productId: string, productName?: string) => Promise<void>;
  clearCompare: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshAll: () => Promise<void>;
  showToast: (
    text: string,
    type?: ToastMessage['type'],
    options?: { title?: string; image?: string; showCartAction?: boolean }
  ) => void;
}

const emptyTotals: CartTotals = {
  itemCount: 0,
  subtotal: 0,
  originalSubtotal: 0,
  productSavings: 0,
  couponDiscount: 0,
  appliedCoupon: null,
  couponMessage: null,
  shippingFee: 0,
  total: 0,
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>(emptyTotals);
  const [areaId, setAreaId] = useState<DeliveryAreaId>('dhaka-north');
  const [couponCode, setCouponCode] = useState<string>('');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [appDealsOpen, setAppDealsOpen] = useState(false);
  const [emiModalProduct, setEmiModalProduct] = useState<Product | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartPulseTick, setCartPulseTick] = useState(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      text: string,
      type: ToastMessage['type'] = 'success',
      options?: { title?: string; image?: string; showCartAction?: boolean }
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev.slice(-2),
        {
          id,
          text,
          type,
          title: options?.title,
          image: options?.image,
          showCartAction: options?.showCartAction,
        },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const launchFlyToCart = useCallback(
    (imageUrl?: string, sourceRect?: FlySourceRect | DOMRect | null) => {
      if (typeof window === 'undefined' || !imageUrl || !sourceRect) return;
      if (sourceRect.width <= 0 || sourceRect.height <= 0) return;

      const cartTarget = document.querySelector('[data-cart-target="true"]') as HTMLElement | null;
      const targetRect = cartTarget?.getBoundingClientRect();

      const endX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 52;
      const endY = targetRect ? targetRect.top + targetRect.height / 2 : 42;
      const startX = sourceRect.left + sourceRect.width / 2;
      const startY = sourceRect.top + sourceRect.height / 2;
      const startSize = Math.min(110, Math.max(56, Math.min(sourceRect.width, sourceRect.height) * 0.72));

      const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setFlyingItems((prev) => [
        ...prev.slice(-4),
        { id, image: imageUrl, startX, startY, startSize, endX, endY },
      ]);

      setTimeout(() => {
        setCartPulseTick((tick) => tick + 1);
      }, 480);

      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== id));
      }, 720);
    },
    []
  );

  const syncCartPayload = useCallback(
    (data: {
      items: CartItem[];
      areaId: DeliveryAreaId;
      couponCode: string;
      totals: CartTotals;
    }) => {
      setCart(data.items ?? []);
      setAreaId(data.areaId ?? 'dhaka-north');
      setCouponCode(data.couponCode ?? '');
      setTotals(data.totals ?? emptyTotals);
    },
    []
  );

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
        setUserOrders(data.orders ?? []);
      }
    } catch {
      // ignore network glitches
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [cartRes, wishRes, cmpRes, authRes] = await Promise.all([
        fetch('/api/cart', { cache: 'no-store' }),
        fetch('/api/wishlist', { cache: 'no-store' }),
        fetch('/api/compare', { cache: 'no-store' }),
        fetch('/api/auth', { cache: 'no-store' }),
      ]);
      if (cartRes.ok) syncCartPayload(await cartRes.json());
      if (wishRes.ok) {
        const w = await wishRes.json();
        setWishlistIds(w.productIds ?? []);
        setWishlistProducts(w.products ?? []);
      }
      if (cmpRes.ok) {
        const c = await cmpRes.json();
        setCompareIds(c.productIds ?? []);
        setCompareProducts(c.products ?? []);
      }
      if (authRes.ok) {
        const a = await authRes.json();
        setUser(a.user ?? null);
        setUserOrders(a.orders ?? []);
      }
    } catch {
      // ignore offline transient
    }
  }, [syncCartPayload]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cartRes, wishRes, cmpRes, authRes] = await Promise.all([
          fetch('/api/cart', { cache: 'no-store' }),
          fetch('/api/wishlist', { cache: 'no-store' }),
          fetch('/api/compare', { cache: 'no-store' }),
          fetch('/api/auth', { cache: 'no-store' }),
        ]);
        if (!active) return;
        if (cartRes.ok) syncCartPayload(await cartRes.json());
        if (wishRes.ok) {
          const w = await wishRes.json();
          setWishlistIds(w.productIds ?? []);
          setWishlistProducts(w.products ?? []);
        }
        if (cmpRes.ok) {
          const c = await cmpRes.json();
          setCompareIds(c.productIds ?? []);
          setCompareProducts(c.products ?? []);
        }
        if (authRes.ok) {
          const a = await authRes.json();
          setUser(a.user ?? null);
          setUserOrders(a.orders ?? []);
        }
      } catch {
        // ignore offline transient
      }
    })();
    return () => {
      active = false;
    };
  }, [syncCartPayload]);

  const addToCart = useCallback(
    async ({
      productId,
      quantity = 1,
      selectedVariant,
      availEmi = false,
      openDrawer = false,
      productName,
      productImage,
      sourceRect,
    }: {
      productId: string;
      quantity?: number;
      selectedVariant?: string;
      availEmi?: boolean;
      openDrawer?: boolean;
      productName?: string;
      productImage?: string;
      sourceRect?: FlySourceRect | DOMRect | null;
    }) => {
      setLoadingCart(true);
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity, selectedVariant, availEmi }),
        });
        if (!res.ok) {
          showToast('Unable to add item to cart.', 'error');
          return false;
        }
        const data = await res.json();
        syncCartPayload(data);

        if (sourceRect && productImage) {
          launchFlyToCart(productImage, sourceRect);
        } else {
          setCartPulseTick((t) => t + 1);
        }

        if (openDrawer) {
          setTimeout(() => setCartOpen(true), sourceRect ? 420 : 0);
        }

        showToast(productName ? productName : 'Item added to your shopping cart', 'success', {
          title: 'Added to Cart',
          image: productImage,
          showCartAction: true,
        });
        return true;
      } finally {
        setLoadingCart(false);
      }
    },
    [launchFlyToCart, showToast, syncCartPayload]
  );

  const updateCartQuantity = useCallback(
    async (
      productId: string,
      quantity: number,
      selectedVariant?: string,
      animateOptions?: { productImage?: string; sourceRect?: FlySourceRect | DOMRect | null }
    ) => {
      setLoadingCart(true);
      try {
        const prevItem = cart.find(
          (i) => i.productId === productId && (i.selectedVariant ?? '') === (selectedVariant ?? '')
        );
        const increased = prevItem ? quantity > prevItem.quantity : quantity > 0;

        const res = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity, selectedVariant }),
        });
        if (res.ok) {
          syncCartPayload(await res.json());
          if (increased) {
            if (animateOptions?.sourceRect && animateOptions?.productImage) {
              launchFlyToCart(animateOptions.productImage, animateOptions.sourceRect);
            } else {
              setCartPulseTick((t) => t + 1);
            }
          }
        }
      } finally {
        setLoadingCart(false);
      }
    },
    [cart, launchFlyToCart, syncCartPayload]
  );

  const removeFromCart = useCallback(
    async (productId: string, selectedVariant?: string) => {
      setLoadingCart(true);
      try {
        const params = new URLSearchParams({ productId });
        if (selectedVariant !== undefined) params.set('variant', selectedVariant);
        const res = await fetch(`/api/cart?${params.toString()}`, { method: 'DELETE' });
        if (res.ok) {
          syncCartPayload(await res.json());
          showToast('Item removed from cart', 'info');
        }
      } finally {
        setLoadingCart(false);
      }
    },
    [showToast, syncCartPayload]
  );

  const clearCart = useCallback(async () => {
    setLoadingCart(true);
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        syncCartPayload(await res.json());
      }
    } finally {
      setLoadingCart(false);
    }
  }, [syncCartPayload]);

  const setDeliveryArea = useCallback(
    async (nextArea: DeliveryAreaId) => {
      setAreaId(nextArea);
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaId: nextArea }),
      });
      if (res.ok) {
        syncCartPayload(await res.json());
      }
    },
    [syncCartPayload]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: code }),
      });
      const data = await res.json();
      syncCartPayload(data);
      return data.totals as CartTotals;
    },
    [syncCartPayload]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.productIds ?? []);
        setWishlistProducts(data.products ?? []);
        showToast(
          data.added
            ? `Saved ${productName ? `"${productName}"` : 'item'} to Wishlist`
            : `Removed ${productName ? `"${productName}"` : 'item'} from Wishlist`,
          data.added ? 'success' : 'info'
        );
      }
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    async (productId: string, productName?: string) => {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompareIds(data.productIds ?? []);
        setCompareProducts(data.products ?? []);
        showToast(
          data.added
            ? `Added ${productName ? `"${productName}"` : 'item'} to Compare (${(data.productIds ?? []).length}/4)`
            : 'Removed from Compare',
          data.added ? 'success' : 'info'
        );
      }
    },
    [showToast]
  );

  const clearCompare = useCallback(async () => {
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true }),
    });
    if (res.ok) {
      setCompareIds([]);
      setCompareProducts([]);
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        totals,
        areaId,
        couponCode,
        wishlistIds,
        wishlistProducts,
        compareIds,
        compareProducts,
        user,
        userOrders,
        cartOpen,
        appDealsOpen,
        emiModalProduct,
        loadingCart,
        cartPulseTick,
        setCartOpen,
        setAppDealsOpen,
        setEmiModalProduct,
        launchFlyToCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setDeliveryArea,
        applyCoupon,
        toggleWishlist,
        toggleCompare,
        clearCompare,
        refreshAuth,
        refreshAll,
        showToast,
      }}
    >
      {children}

      {/* Flying Product-to-Cart Animation Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[95] overflow-hidden"
      >
        {flyingItems.map((item) => {
          const midX = (item.startX + item.endX) / 2;
          const arcY = Math.min(item.startY, item.endY) - 65;
          return (
            <motion.div
              key={item.id}
              data-testid="flying-product-item"
              initial={{
                x: item.startX - item.startSize / 2,
                y: item.startY - item.startSize / 2,
                width: item.startSize,
                height: item.startSize,
                scale: 1,
                rotate: 0,
                opacity: 0.95,
              }}
              animate={{
                x: [
                  item.startX - item.startSize / 2,
                  midX - item.startSize / 2,
                  item.endX - 18,
                ],
                y: [
                  item.startY - item.startSize / 2,
                  arcY - item.startSize / 2,
                  item.endY - 18,
                ],
                scale: [1, 0.85, 0.24],
                rotate: [0, -10, 14],
                opacity: [1, 0.96, 0.2],
              }}
              transition={{
                duration: 0.62,
                times: [0, 0.45, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed left-0 top-0 rounded-xl border-2 border-[#1868b7] bg-white p-1.5 shadow-2xl"
            >
              <img
                src={item.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Animated Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-4 sm:right-5 z-[90] flex flex-col gap-2.5 pointer-events-none w-[calc(100vw-2rem)] max-w-sm"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              role="status"
              data-testid="toast-notification"
              className={`pointer-events-auto flex items-center gap-3 rounded-lg p-3 shadow-2xl border ${
                t.type === 'error'
                  ? 'bg-red-600 text-white border-red-700'
                  : t.type === 'info'
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-emerald-200 ring-1 ring-emerald-500/20'
              }`}
            >
              {t.image ? (
                <div className="h-11 w-11 shrink-0 rounded-md border border-slate-200 bg-white p-1 overflow-hidden">
                  <img
                    src={t.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    t.type === 'error'
                      ? 'bg-red-500/30 text-white'
                      : t.type === 'info'
                      ? 'bg-slate-700 text-blue-300'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {t.type === 'error' ? (
                    <AlertCircle size={18} />
                  ) : t.type === 'info' ? (
                    <Info size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {t.title && (
                  <p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>{t.title}</span>
                  </p>
                )}
                <p
                  className={`text-xs sm:text-[13px] font-semibold line-clamp-2 ${
                    t.type === 'success' ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  {t.text}
                </p>
                {t.showCartAction && (
                  <button
                    type="button"
                    onClick={() => {
                      dismissToast(t.id);
                      setCartOpen(true);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#1868b7] hover:underline"
                  >
                    <ShoppingBag size={12} />
                    <span>View Cart ({totals.itemCount}) &rarr;</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className={`rounded p-1 transition-colors shrink-0 ${
                  t.type === 'success'
                    ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    : 'text-white/75 hover:bg-white/15 hover:text-white'
                }`}
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
