'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LogOut, Package, ShieldCheck, User } from 'lucide-react';
import { useStore } from '@/components/StoreProvider';
import { DELIVERY_AREAS, formatTk } from '@/lib/store-logic';
import type { DeliveryAreaId } from '@/lib/types';

export default function AccountPage() {
  const { user, userOrders, refreshAuth, showToast } = useStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regArea, setRegArea] = useState<DeliveryAreaId>('dhaka-north');

  // Profile update form (null until edited, falling back to user values)
  const [profNameDraft, setProfNameDraft] = useState<string | null>(null);
  const [profPhoneDraft, setProfPhoneDraft] = useState<string | null>(null);
  const [profAreaDraft, setProfAreaDraft] = useState<DeliveryAreaId | null>(null);
  const [profAddressDraft, setProfAddressDraft] = useState<string | null>(null);

  const profName = profNameDraft ?? user?.name ?? '';
  const profPhone = profPhoneDraft ?? user?.phone ?? '';
  const profArea = profAreaDraft ?? user?.defaultAreaId ?? 'dhaka-north';
  const profAddress = profAddressDraft ?? user?.defaultAddress ?? '';
  const setProfName = (v: string) => setProfNameDraft(v);
  const setProfPhone = (v: string) => setProfPhoneDraft(v);
  const setProfArea = (v: DeliveryAreaId) => setProfAreaDraft(v);
  const setProfAddress = (v: string) => setProfAddressDraft(v);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo' }),
      });
      if (res.ok) {
        await refreshAuth();
        showToast('Signed in as Tariqul Islam (Demo Customer)');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Sign in failed.');
        return;
      }
      await refreshAuth();
      showToast(`Welcome back, ${data.user.name}!`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          defaultAreaId: regArea,
          defaultAddress: regAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Registration failed.');
        return;
      }
      await refreshAuth();
      showToast(`Account created for ${data.user.name}!`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          name: profName,
          phone: profPhone,
          defaultAreaId: profArea,
          defaultAddress: profAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Unable to save profile.');
        return;
      }
      await refreshAuth();
      showToast('Profile & default shipping address updated');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    await refreshAuth();
    showToast('Signed out', 'info');
  };

  return (
    <div className="mx-auto max-w-[1160px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">My Account</span>
      </nav>

      {!user ? (
        <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h1 className="text-xl font-bold text-slate-900">
              {tab === 'login' ? 'Sign In to Mrtom shop' : 'Create Mrtom shop Account'}
            </h1>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`rounded px-3 py-1.5 font-semibold ${
                  tab === 'login'
                    ? 'bg-[#1e5fa8] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`rounded px-3 py-1.5 font-semibold ${
                  tab === 'register'
                    ? 'bg-[#1e5fa8] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="acc-id" className="block text-xs font-semibold text-slate-700 mb-1">
                  Email or Mobile Number
                </label>
                <input
                  id="acc-id"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="tariqul@example.com or 01712345678"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="acc-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="acc-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#1e5fa8] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-[#1e5fa8] py-2.5 text-sm font-bold text-white hover:bg-[#164b87]"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="border-t border-slate-200 pt-4 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Want to test orders &amp; saved addresses right away?
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={submitting}
                  className="w-full rounded border border-[#f26522] bg-orange-50 py-2 text-xs font-bold text-[#f26522] hover:bg-orange-100"
                >
                  Quick Demo Login (Tariqul Islam · 2 Sample Orders)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile (BD)
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-area" className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Area
                </label>
                <select
                  id="reg-area"
                  value={regArea}
                  onChange={(e) => setRegArea(e.target.value as DeliveryAreaId)}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {DELIVERY_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.division} — {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reg-addr" className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Address
                </label>
                <input
                  id="reg-addr"
                  type="text"
                  required
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="House, Road, Area"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-[#f26522] py-2.5 text-sm font-bold text-white hover:bg-[#d95516]"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e5fa8] text-white">
                <User size={22} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-xs text-slate-500">
                  {user.email} · {user.phone}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Editor */}
            <form
              onSubmit={handleProfileSave}
              className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-5 space-y-4 self-start"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <ShieldCheck size={17} className="text-[#1e5fa8]" />
                <h2 className="text-base font-bold text-slate-900">Profile &amp; Delivery Address</h2>
              </div>

              <div>
                <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="prof-area" className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Area
                </label>
                <select
                  id="prof-area"
                  value={profArea}
                  onChange={(e) => setProfArea(e.target.value as DeliveryAreaId)}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {DELIVERY_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.division} — {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prof-addr" className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Street Address
                </label>
                <textarea
                  id="prof-addr"
                  rows={2}
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-[#1e5fa8] py-2 text-xs font-bold text-white hover:bg-[#164b87]"
              >
                Save Changes
              </button>
            </form>

            {/* Orders List */}
            <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Package size={17} className="text-[#1e5fa8]" />
                  <h2 className="text-base font-bold text-slate-900">
                    My Orders ({userOrders.length})
                  </h2>
                </div>
                <Link href="/track-order" className="text-xs font-semibold text-[#1e5fa8] hover:underline">
                  Track Another Order &rarr;
                </Link>
              </div>

              {userOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No orders placed yet under this account.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {userOrders.map((ord) => (
                    <div key={ord.orderNumber} className="py-3.5 first:pt-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#1e5fa8]">#{ord.orderNumber}</p>
                          <p className="text-xs text-slate-500">
                            {ord.items.length} item(s) · {ord.areaLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-[#1e5fa8]">
                            {ord.status}
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                            {formatTk(ord.total)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}`}
                        className="inline-block text-xs font-semibold text-[#f26522] hover:underline"
                      >
                        View Tracking &amp; Receipt &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
