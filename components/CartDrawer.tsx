'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatTk } from '@/lib/store-logic';
import { useStore } from './StoreProvider';

export default function CartDrawer() {
  const {
    cart,
    totals,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    loadingCart,
  } = useStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/45"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#1e5fa8] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} />
                <h2 className="text-base font-bold">
                  Shopping Cart ({totals.itemCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close shopping cart"
                className="rounded p-1 hover:bg-white/15 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <ShoppingBag size={26} />
                </div>
                <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
                <p className="mt-1 text-sm text-slate-500">
                  Browse Mrtom shop&apos;s top categories or hot deals to add items.
                </p>
                <Link
                  href="/deals"
                  onClick={() => setCartOpen(false)}
                  className="mt-5 rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#174d8a]"
                >
                  Explore Hot Deals
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.selectedVariant ?? 'default'}`}
                      className="flex gap-3 pt-3 first:pt-0"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="h-20 w-20 shrink-0 rounded border border-slate-200 bg-white p-1 overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-sm font-medium text-slate-800 hover:text-[#1e5fa8] line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.selectedVariant && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.selectedVariant}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-sm font-bold text-[#1e5fa8] tabular-nums">
                            {formatTk(item.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="inline-flex items-center rounded border border-slate-300">
                              <button
                                type="button"
                                disabled={loadingCart}
                                aria-label={`Decrease quantity of ${item.name}`}
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                    item.selectedVariant
                                  )
                                }
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                              >
                                <Minus size={12} />
                              </button>
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                  key={item.quantity}
                                  initial={{ y: 6, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -6, opacity: 0 }}
                                  transition={{ duration: 0.14 }}
                                  className="px-2.5 text-xs font-semibold tabular-nums inline-block"
                                >
                                  {item.quantity}
                                </motion.span>
                              </AnimatePresence>
                              <button
                                type="button"
                                disabled={loadingCart}
                                aria-label={`Increase quantity of ${item.name}`}
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity + 1,
                                    item.selectedVariant
                                  )
                                }
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              disabled={loadingCart}
                              aria-label={`Remove ${item.name} from cart`}
                              onClick={() =>
                                removeFromCart(item.productId, item.selectedVariant)
                              }
                              className="rounded p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatTk(totals.subtotal)}
                      </span>
                    </div>
                    {totals.productSavings > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>Total Savings</span>
                        <span className="font-semibold tabular-nums">
                          -{formatTk(totals.productSavings)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Fee</span>
                      <span className="font-medium tabular-nums">
                        {totals.shippingFee === 0 ? 'FREE' : formatTk(totals.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-[#1e5fa8] tabular-nums">{formatTk(totals.total)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/cart"
                      onClick={() => setCartOpen(false)}
                      className="rounded border border-[#1e5fa8] bg-white py-2.5 text-center text-sm font-semibold text-[#1e5fa8] hover:bg-blue-50 transition-colors"
                    >
                      View Cart
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={() => setCartOpen(false)}
                      className="rounded bg-[#f26522] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#d95516] transition-colors"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
