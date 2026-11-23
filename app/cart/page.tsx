'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/components/StoreProvider';
import { DELIVERY_AREAS, formatTk } from '@/lib/store-logic';
import type { DeliveryAreaId } from '@/lib/types';

export default function CartPage() {
  const {
    cart,
    totals,
    areaId,
    couponCode,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setDeliveryArea,
    applyCoupon,
    loadingCart,
  } = useStore();

  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponStatus, setCouponStatus] = useState<string | null>(totals.couponMessage);

  const handleApplyCoupon = async (codeToUse: string) => {
    const updated = await applyCoupon(codeToUse);
    setCouponStatus(updated.couponMessage);
  };

  return (
    <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Shopping Cart</span>
      </nav>

      {/* Othoba Progress Stepper (matches othoba-cart.png) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 text-sm sm:text-base font-bold">
        <span className="text-[#3492db]">Shopping Cart</span>
        <ChevronRight size={16} className="text-slate-400" />
        <Link href="/checkout" className="text-slate-500 hover:text-[#1868b7]">
          Checkout
        </Link>
        <ChevronRight size={16} className="text-slate-400" />
        <span className="text-slate-500">Order Complete</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Shopping Cart ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
        </h1>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your shopping cart is currently empty</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add products from Mrtom shop&apos;s Hot Deals or explore our 24 shopping categories.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/deals"
              className="rounded bg-[#f26522] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d95516]"
            >
              Browse Hot Deals
            </Link>
            <Link
              href="/products"
              className="rounded border border-[#1e5fa8] px-5 py-2.5 text-sm font-semibold text-[#1e5fa8] hover:bg-blue-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-3">
            <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedVariant ?? 'default'}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="h-24 w-24 shrink-0 rounded border border-slate-200 bg-white p-1.5 flex items-center justify-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm sm:text-base font-semibold text-slate-900 hover:text-[#1e5fa8] line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Sold by {item.sellerName}
                      {item.selectedVariant ? ` · ${item.selectedVariant}` : ''}
                      {item.availEmi ? ' · 0% EMI Selected' : ''}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-[#1e5fa8] tabular-nums">
                        {formatTk(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatTk(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="inline-flex items-center rounded border border-slate-300 bg-white">
                      <button
                        type="button"
                        disabled={loadingCart}
                        aria-label={`Decrease quantity for ${item.name}`}
                        onClick={() =>
                          updateCartQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.selectedVariant
                          )
                        }
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={loadingCart}
                        aria-label={`Increase quantity for ${item.name}`}
                        onClick={() =>
                          updateCartQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedVariant
                          )
                        }
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                        {formatTk(item.price * item.quantity)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={loadingCart}
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item.productId, item.selectedVariant)}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Order Summary
              </h2>

              {/* Delivery Area */}
              <div>
                <label htmlFor="cart-area" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                  <MapPin size={14} className="text-[#1e5fa8]" />
                  <span>Delivery Location</span>
                </label>
                <select
                  id="cart-area"
                  value={areaId}
                  onChange={(e) => setDeliveryArea(e.target.value as DeliveryAreaId)}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#1e5fa8] focus:outline-none"
                >
                  {DELIVERY_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.label} ({formatTk(area.fee)} · {area.eta})
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Form */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label htmlFor="cart-coupon" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Tag size={14} className="text-[#f26522]" />
                  <span>Promo / Coupon Code</span>
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon(couponInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    id="cart-coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="MRTOM10 / FREESHIP"
                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-xs uppercase focus:border-[#1e5fa8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded bg-[#1e5fa8] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#164b87]"
                  >
                    Apply
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {['MRTOM10', 'WELCOME150', 'FREESHIP'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCouponInput(code);
                        handleApplyCoupon(code);
                      }}
                      className="rounded border border-dashed border-blue-300 bg-blue-50 px-2 py-0.5 font-semibold text-[#1e5fa8] hover:bg-blue-100"
                    >
                      Use {code}
                    </button>
                  ))}
                </div>
                {(couponStatus || totals.couponMessage) && (
                  <p
                    className={`text-xs font-medium ${
                      totals.appliedCoupon ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {couponStatus || totals.couponMessage}
                  </p>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatTk(totals.subtotal)}
                  </span>
                </div>
                {totals.productSavings > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Product Savings</span>
                    <span className="font-semibold tabular-nums">
                      -{formatTk(totals.productSavings)}
                    </span>
                  </div>
                )}
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Coupon ({totals.appliedCoupon})</span>
                    <span className="font-semibold tabular-nums">
                      -{formatTk(totals.couponDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-medium tabular-nums">
                    {totals.shippingFee === 0 ? 'FREE' : formatTk(totals.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-[#1e5fa8] tabular-nums">{formatTk(totals.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#f26522] py-3 text-sm font-bold text-white hover:bg-[#d95516] transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
