'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, ShieldCheck, Store, TrendingUp, Truck } from 'lucide-react';
import { CATEGORIES } from '@/lib/catalog/categories';

export default function SellOnOthobaPage() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [city, setCity] = useState('Dhaka');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, ownerName, phone, email, category, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not submit application.');
        return;
      }
      setSuccessMsg(data.message);
      setBusinessName('');
      setOwnerName('');
      setPhone('');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">Sell on Mrtom shop</span>
      </nav>

      <div className="rounded-lg bg-gradient-to-r from-[#164b87] to-[#1e5fa8] p-6 sm:p-10 text-white">
        <span className="inline-block rounded bg-[#ffd43b] px-2.5 py-0.5 text-[11px] font-bold uppercase text-slate-900">
          Mrtom shop Merchant Center
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">
          Grow Your Business Across All 64 Districts of Bangladesh
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Join verified brands like RFL, VISION, Regal, Daily Shopping, and Playtime on
          Mrtom shop with zero listing fee, logistics pickup, and fast weekly payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Why Sell With Mrtom shop?</h2>
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-[#1e5fa8] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">Nationwide Customer Reach</p>
                <p className="text-xs text-slate-500">Showcase your catalog to millions of active shoppers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck size={18} className="text-[#f26522] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">End-to-End Logistics Support</p>
                <p className="text-xs text-slate-500">Dedicated doorstep pickup &amp; Cash on Delivery collection.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">Verified Storefront Badge</p>
                <p className="text-xs text-slate-500">Dedicated brand page, promotional campaigns, and 0% EMI tools.</p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store size={18} className="text-[#1e5fa8]" />
            <h2 className="text-base font-bold text-slate-900">Merchant Registration Form</h2>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs sm:text-sm text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sel-biz" className="block text-xs font-semibold text-slate-700 mb-1">
                Business / Store Name *
              </label>
              <input
                id="sel-biz"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Bengal Electronics BD"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sel-owner" className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Person Name *
              </label>
              <input
                id="sel-owner"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sel-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                id="sel-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sel-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Business Email *
              </label>
              <input
                id="sel-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@company.com"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sel-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Category
              </label>
              <select
                id="sel-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sel-city" className="block text-xs font-semibold text-slate-700 mb-1">
                City / Warehouse Location
              </label>
              <input
                id="sel-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-[#f26522] py-2.5 text-sm font-bold text-white hover:bg-[#d95516]"
          >
            {submitting ? 'Submitting Application...' : 'Submit Seller Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
