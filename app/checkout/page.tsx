'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/StoreProvider';
import { DELIVERY_AREAS, formatTk } from '@/lib/store-logic';
import type { DeliveryAreaId, Order, PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const { cart, totals, areaId, couponCode, user, setDeliveryArea, refreshAll, showToast } =
    useStore();

  const [customerNameDraft, setCustomerNameDraft] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const customerName = customerNameDraft ?? user?.name ?? '';
  const phone = phoneDraft ?? user?.phone ?? '';
  const email = emailDraft ?? user?.email ?? '';
  const address = addressDraft ?? user?.defaultAddress ?? '';
  const setCustomerName = (v: string) => setCustomerNameDraft(v);
  const setPhone = (v: string) => setPhoneDraft(v);
  const setEmail = (v: string) => setEmailDraft(v);
  const setAddress = (v: string) => setAddressDraft(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          areaId,
          address,
          notes,
          paymentMethod,
          couponCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: 'Please fix the highlighted checkout fields.' });
        showToast('Please review the required shipping details.', 'error');
        return;
      }

      setConfirmedOrder(data.order);
      await refreshAll();
      showToast(`Order #${data.order.orderNumber} placed successfully!`);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-emerald-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Order Confirmed
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Thank you, {confirmedOrder.customerName}!
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Your order{' '}
                <strong className="text-[#1e5fa8]">{confirmedOrder.orderNumber}</strong> has been
                received. Estimated delivery: <strong>{confirmedOrder.estimatedDelivery}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Delivery Address</p>
              <p className="mt-1 font-semibold text-slate-900">{confirmedOrder.customerName}</p>
              <p className="text-slate-700">{confirmedOrder.phone}</p>
              <p className="text-slate-600">
                {confirmedOrder.address}, {confirmedOrder.areaLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Payment Summary</p>
              <p className="mt-1 font-semibold text-slate-900 uppercase">
                Method: {confirmedOrder.paymentMethod}
              </p>
              <p className="text-slate-700">Status: {confirmedOrder.status}</p>
              <p className="text-base font-bold text-[#1e5fa8] tabular-nums mt-1">
                Total Payable: {formatTk(confirmedOrder.total)}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-200">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 py-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded border border-slate-200 object-contain bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">
                  {formatTk(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/track-order?order=${encodeURIComponent(confirmedOrder.orderNumber)}`}
              className="rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#164b87]"
            >
              Track Order Status
            </Link>
            <Link
              href="/"
              className="rounded border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <Link href="/cart" className="hover:text-[#1e5fa8]">
          Cart
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Checkout</span>
      </nav>

      {/* Othoba Progress Stepper */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 text-sm sm:text-base font-bold">
        <Link href="/cart" className="text-slate-500 hover:text-[#1868b7]">
          Shopping Cart
        </Link>
        <ChevronRight size={16} className="text-slate-400" />
        <span className="text-[#3492db]">Checkout</span>
        <ChevronRight size={16} className="text-slate-400" />
        <span className="text-slate-500">Order Complete</span>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Secure Checkout</h1>

      {cart.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">Your cart is empty</p>
          <p className="text-sm text-slate-500">Add products before proceeding to checkout.</p>
          <Link
            href="/products"
            className="inline-block rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1: Delivery Info */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck size={18} className="text-[#1e5fa8]" />
                <h2 className="text-base font-bold text-slate-900">1. Shipping Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chk-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Bangladesh Mobile Number *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="chk-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="chk-area" className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery City / Area *
                  </label>
                  <select
                    id="chk-area"
                    value={areaId}
                    onChange={(e) => setDeliveryArea(e.target.value as DeliveryAreaId)}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                  >
                    {DELIVERY_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.division} — {area.label} ({formatTk(area.fee)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="chk-address" className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Street Address *
                </label>
                <textarea
                  id="chk-address"
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Road #, Block/Sector, Landmark..."
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="chk-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  id="chk-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery after 4 PM"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard size={18} className="text-[#1e5fa8]" />
                <h2 className="text-base font-bold text-slate-900">2. Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      id: 'cod',
                      label: 'Cash on Delivery',
                      desc: 'Pay cash when parcel arrives',
                      icon: Banknote,
                    },
                    {
                      id: 'bkash',
                      label: 'bKash Payment',
                      desc: 'Instant mobile wallet checkout',
                      icon: Smartphone,
                    },
                    {
                      id: 'nagad',
                      label: 'Nagad Wallet',
                      desc: 'Fast & secure mobile payment',
                      icon: Smartphone,
                    },
                    {
                      id: 'card',
                      label: 'Visa / Mastercard / Amex',
                      desc: '0% EMI eligible cards supported',
                      icon: CreditCard,
                    },
                  ] as const
                ).map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 rounded-md border p-3.5 cursor-pointer transition-colors ${
                        active
                          ? 'border-[#1e5fa8] bg-blue-50/70'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={active}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Icon size={15} className="text-[#1e5fa8]" />
                          <span>{method.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{method.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Review Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4 sticky top-28">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Order Review ({totals.itemCount} items)
              </h2>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedVariant ?? 'default'}`}
                    className="flex items-center justify-between gap-2.5 py-2.5 first:pt-0 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded border border-slate-200 object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">
                      {formatTk(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold tabular-nums">{formatTk(totals.subtotal)}</span>
                </div>
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Coupon ({totals.appliedCoupon})</span>
                    <span className="font-semibold tabular-nums">
                      -{formatTk(totals.couponDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium tabular-nums">
                    {totals.shippingFee === 0 ? 'FREE' : formatTk(totals.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-[#1e5fa8] tabular-nums">{formatTk(totals.total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-[#f26522] py-3 text-sm font-bold text-white hover:bg-[#d95516] transition-colors disabled:opacity-60"
              >
                {submitting ? 'Placing Order...' : `Confirm Order (${formatTk(totals.total)})`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Buyer Protection · 7-Day Easy Return</span>
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
