'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, Package, Search, Truck } from 'lucide-react';
import { formatTk } from '@/lib/store-logic';
import type { Order, OrderStatus } from '@/lib/types';

const STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Packed & Dispatched',
  'Out for Delivery',
  'Delivered',
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('order') ?? 'OTH-2026-1042';

  const [orderDraft, setOrderDraft] = useState<string | null>(null);
  const orderInput = orderDraft ?? initialQuery;
  const [recentOrderIds, setRecentOrderIds] = useState<string[]>(['OTH-2026-1042', 'OTH-2026-1041']);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupOrder = useCallback(async (orderId: string) => {
    const clean = orderId.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error ?? 'Order not found.');
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/orders', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.orders?.length) return;
        const ids = Array.from(
          new Set((data.orders as Order[]).map((o) => o.orderNumber))
        ).slice(0, 5);
        setRecentOrderIds(ids);
      })
      .catch(() => {
        // ignore
      });

    if (initialQuery) {
      fetch(`/api/orders/${encodeURIComponent(initialQuery.trim())}`, { cache: 'no-store' })
        .then(async (res) => ({ ok: res.ok, data: await res.json() }))
        .then(({ ok, data }) => {
          if (!active) return;
          if (!ok) {
            setOrder(null);
            setError(data.error ?? 'Order not found.');
          } else {
            setOrder(data.order);
            setError(null);
          }
        })
        .catch(() => {
          // ignore abort
        });
    }
    return () => {
      active = false;
    };
  }, [initialQuery]);

  const currentStepIndex = order
    ? Math.max(0, STATUS_STEPS.indexOf(order.status))
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Track Order</span>
      </nav>

      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Truck size={22} className="text-[#1e5fa8]" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Track Your Order</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your Mrtom shop Order ID to inspect real-time parcel status and items.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupOrder(orderInput);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={orderInput}
            onChange={(e) => setOrderDraft(e.target.value)}
            placeholder="Enter Order ID (e.g. OTH-2026-1042)"
            aria-label="Order ID"
            className="flex-1 rounded border border-slate-300 px-3.5 py-2.5 text-sm uppercase focus:border-[#1e5fa8] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#1e5fa8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#164b87]"
          >
            <Search size={16} />
            <span>{loading ? 'Checking...' : 'Track Order'}</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>Recent &amp; sample orders:</span>
          {recentOrderIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOrderDraft(id);
                lookupOrder(id);
              }}
              className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 font-semibold text-[#1868b7] hover:border-[#1868b7]"
            >
              {id}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {order && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs text-slate-500">Order Reference</p>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1e5fa8]">
                #{order.orderNumber}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#1e5fa8]">
                <Package size={14} />
                {order.status}
              </span>
              <p className="mt-1 text-xs text-slate-500">ETA: {order.estimatedDelivery}</p>
            </div>
          </div>

          {/* 5-step progress */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STATUS_STEPS.map((step, idx) => {
              const reached = idx <= currentStepIndex;
              return (
                <div
                  key={step}
                  className={`rounded-md border p-3 text-center ${
                    reached
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    size={18}
                    className={`mx-auto mb-1 ${
                      reached ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <p className="text-[11px] font-bold leading-tight">{step}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Recipient</p>
              <p className="font-bold text-slate-900 mt-1">{order.customerName}</p>
              <p className="text-slate-600">{order.phone}</p>
              <p className="text-slate-600">
                {order.address}, {order.areaLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Order Totals</p>
              <p className="text-slate-700 mt-1 uppercase">Payment: {order.paymentMethod}</p>
              <p className="text-slate-700">Subtotal: {formatTk(order.subtotal)}</p>
              <p className="text-base font-bold text-[#1e5fa8] tabular-nums mt-1">
                Total: {formatTk(order.total)}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-200">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 text-xs sm:text-sm">
                <Link href={`/product/${item.slug}`} className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded border border-slate-200 object-contain bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 hover:text-[#1e5fa8] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                </Link>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">
                  {formatTk(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-500">
          Loading order tracking...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
