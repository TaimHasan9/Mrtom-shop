'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Smartphone, Tag, X } from 'lucide-react';
import { OTHOBA_STATIC } from '@/lib/catalog/othoba-assets';
import { useStore } from './StoreProvider';

export default function AppDealsModal() {
  const { appDealsOpen, setAppDealsOpen, showToast } = useStore();

  if (!appDealsOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[65] flex items-center justify-center bg-black/55 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-deals-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-lg rounded-lg bg-white shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between bg-[#1868b7] px-5 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <Smartphone size={18} />
              <h2 id="app-deals-title" className="text-base font-bold">
                Mrtom shop App Exclusive Deals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAppDealsOpen(false)}
              aria-label="Close App Deals dialog"
              className="rounded p-1 hover:bg-white/15 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4 rounded-md bg-gradient-to-r from-[#5a1f8c] via-[#712bb2] to-[#3492db] p-4 text-white">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Shop Smarter, Live Better
                </p>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  Unlock App-Only Prices &amp; Coupon Offers
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <img
                    src={OTHOBA_STATIC.googlePlayBtn}
                    alt="Get it on Google Play"
                    className="h-9 w-auto object-contain"
                  />
                  <img
                    src={OTHOBA_STATIC.appStoreBtn}
                    alt="Download on the App Store"
                    className="h-9 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block shrink-0 rounded bg-white p-1.5">
                <img
                  src={OTHOBA_STATIC.appQr}
                  alt="Scan QR to download Mrtom shop App"
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-[#f26522]" />
                  <span>
                    Coupon <strong className="text-slate-900">MRTOM10</strong> — 10% OFF (up to Tk 1,000)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('MRTOM10');
                    showToast('Copied coupon code MRTOM10');
                  }}
                  className="text-xs font-semibold text-[#1868b7] hover:underline"
                >
                  Copy
                </button>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-[#f26522]" />
                  <span>
                    Coupon <strong className="text-slate-900">FREESHIP</strong> — Free Delivery Nationwide
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('FREESHIP');
                    showToast('Copied coupon code FREESHIP');
                  }}
                  className="text-xs font-semibold text-[#1868b7] hover:underline"
                >
                  Copy
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-700 pt-1">
                <CheckCircle2 size={15} />
                <span>Apply these codes directly in your Cart or Checkout page.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAppDealsOpen(false)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                href="/deals"
                onClick={() => setAppDealsOpen(false)}
                className="rounded bg-[#f26522] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95516]"
              >
                Browse Hot Deals
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
