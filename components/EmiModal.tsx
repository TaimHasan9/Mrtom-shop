'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CreditCard, ShieldCheck, X } from 'lucide-react';
import { calculateEmiMonthly, formatTk } from '@/lib/store-logic';
import { useStore } from './StoreProvider';

const EMI_TENURES = [3, 6, 9, 12, 18, 24, 36];
const PARTNER_BANKS = [
  'BRAC Bank',
  'City Bank (Amex)',
  'Eastern Bank (EBL)',
  'Dutch-Bangla Bank',
  'Prime Bank',
  'Standard Chartered',
  'Islami Bank',
  'Bank Asia',
];

export default function EmiModal() {
  const { emiModalProduct, setEmiModalProduct, addToCart } = useStore();
  const [selectedTenure, setSelectedTenure] = useState(12);

  if (!emiModalProduct) return null;

  const monthly = calculateEmiMonthly(emiModalProduct.price, selectedTenure);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[65] flex items-center justify-center bg-black/55 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emi-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-2xl rounded-lg bg-white shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between bg-[#1e5fa8] px-5 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <CreditCard size={18} />
              <h2 id="emi-modal-title" className="text-base font-bold">
                0% EMI Installment Plans
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEmiModalProduct(null)}
              aria-label="Close EMI modal"
              className="rounded p-1 hover:bg-white/15 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 rounded-md bg-slate-50 border border-slate-200 p-3.5">
              <div>
                <p className="text-xs font-medium text-slate-500">Selected Product</p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {emiModalProduct.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Product Price</p>
                <p className="text-base font-bold text-[#1e5fa8] tabular-nums">
                  {formatTk(emiModalProduct.price)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Select Installment Tenure
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {EMI_TENURES.map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setSelectedTenure(months)}
                    className={`rounded border px-2.5 py-2 text-center text-xs font-semibold transition-colors ${
                      selectedTenure === months
                        ? 'border-[#1e5fa8] bg-[#1e5fa8] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#1e5fa8]'
                    }`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-blue-900">
                  Estimated Monthly Payment ({selectedTenure} Months · 0% Interest)
                </p>
                <p className="text-2xl font-bold text-[#1e5fa8] tabular-nums mt-0.5">
                  {formatTk(monthly)} <span className="text-xs font-normal text-slate-600">/ month</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  addToCart({
                    productId: emiModalProduct.id,
                    quantity: 1,
                    availEmi: true,
                    openDrawer: true,
                    productName: emiModalProduct.name,
                  });
                  setEmiModalProduct(null);
                }}
                className="rounded bg-[#f26522] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d95516] transition-colors whitespace-nowrap"
              >
                Add to Cart with EMI
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Eligible Credit Card Partner Banks (Orders Tk 5,000+)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {PARTNER_BANKS.map((bank) => (
                  <div
                    key={bank}
                    className="rounded border border-slate-200 bg-white px-2.5 py-2 text-slate-700 font-medium"
                  >
                    {bank}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p>
                0% EMI applies automatically at payment gateway selection for supported local Visa,
                Mastercard, and Amex credit cards on qualifying orders.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
