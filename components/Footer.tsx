'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Facebook, Linkedin, Mail, Star, Twitter, Youtube } from 'lucide-react';
import { OTHOBA_STATIC } from '@/lib/catalog/othoba-assets';
import OthobaLogo from './OthobaLogo';
import { useStore } from './StoreProvider';

export default function Footer() {
  const { setAppDealsOpen } = useStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ ok: true, text: data.message });
        setEmail('');
      } else {
        setFeedback({ ok: false, text: data.error ?? 'Subscription failed.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="mt-12 w-full bg-white">
      {/* Full-Width Othoba Blue Newsletter & App Download Strip (matches live othoba-home-footer.png) */}
      <div className="bg-[#3492db] text-white">
        <div className="mx-auto flex max-w-[1360px] flex-col lg:flex-row lg:items-center justify-between gap-5 px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-white/30 bg-white/10">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-[15px] font-bold uppercase tracking-wide">
                SUBSCRIBE TO OUR NEWSLETTER
              </h2>
              <p className="text-xs text-blue-50">
                Get all the latest information on Events, Sales and Offers.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="flex w-full lg:max-w-sm overflow-hidden rounded bg-white shadow-2xs"
          >
            <input
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your E-mail Address"
              aria-label="Newsletter email address"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1868b7] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#125293] transition-colors whitespace-nowrap shrink-0"
            >
              {submitting ? 'Sending...' : 'Subscribe'}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                DOWNLOAD OUR NEW APP TODAY!
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-50">
                Don&apos;t Miss our mobile-only offers and shop with Android Play.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAppDealsOpen(true)}
              className="inline-flex items-center gap-2 rounded border border-white/80 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white hover:text-[#1868b7] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Download</span>
              <Download size={15} />
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 pb-3">
            <p
              className={`rounded px-3 py-1.5 text-xs font-medium inline-block ${
                feedback.ok ? 'bg-emerald-700/90 text-white' : 'bg-red-700/90 text-white'
              }`}
            >
              {feedback.text}
            </p>
          </div>
        )}
      </div>

      {/* Main White 4-Column Footer (matches live othoba-home-footer.png) */}
      <div className="bg-white text-slate-600 border-t border-slate-200">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-8 px-4 sm:px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <OthobaLogo variant="dark" size="lg" />
            <div className="space-y-1 pt-1">
              <p className="text-xs text-slate-600">Got Question? Call us 9 AM- 10 PM</p>
              <a
                href="tel:09613800800"
                className="block text-lg font-extrabold text-slate-900 hover:text-[#1868b7] tabular-nums"
              >
                09613-800800
              </a>
            </div>
            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-slate-600">Follow Us</p>
              <div className="flex items-center gap-2">
                <a
                  href="#follow-facebook"
                  onClick={(e) => {
                    e.preventDefault();
                    setAppDealsOpen(true);
                  }}
                  aria-label="Follow Mrtom shop on Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b5998] text-white hover:opacity-90"
                >
                  <Facebook size={15} />
                </a>
                <a
                  href="#follow-twitter"
                  onClick={(e) => {
                    e.preventDefault();
                    setAppDealsOpen(true);
                  }}
                  aria-label="Follow Mrtom shop on Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1da1f2] text-white hover:opacity-90"
                >
                  <Twitter size={15} />
                </a>
                <a
                  href="#follow-linkedin"
                  onClick={(e) => {
                    e.preventDefault();
                    setAppDealsOpen(true);
                  }}
                  aria-label="Follow Mrtom shop on LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077b5] text-white hover:opacity-90"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href="#follow-youtube"
                  onClick={(e) => {
                    e.preventDefault();
                    setAppDealsOpen(true);
                  }}
                  aria-label="Follow Mrtom shop on YouTube"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24598f] text-white hover:opacity-90"
                >
                  <Youtube size={15} />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1">
              <span>See our reviews on</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-slate-900">
                <Star size={14} className="fill-[#00b67a] text-[#00b67a]" />
                Trustpilot
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3.5">
              COMPANY
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/info/about-us" className="hover:text-[#1868b7] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/info/careers" className="hover:text-[#1868b7] transition-colors">
                  Career
                </Link>
              </li>
              <li>
                <Link href="/info/help-center" className="hover:text-[#1868b7] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/info/privacy-policy" className="hover:text-[#1868b7] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/info/warranty-policy" className="hover:text-[#1868b7] transition-colors">
                  Mrtom Certified
                </Link>
              </li>
              <li>
                <Link href="/info/terms-conditions" className="hover:text-[#1868b7] transition-colors">
                  Terms &amp; Condition (শর্তাবলী)
                </Link>
              </li>
              <li>
                <Link href="/info/shipping-policy" className="hover:text-[#1868b7] transition-colors">
                  Next/Same day delivery TC
                </Link>
              </li>
              <li>
                <Link href="/sell-on-othoba" className="hover:text-[#1868b7] font-semibold text-[#1868b7] transition-colors">
                  Sell on Mrtom shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3.5">
              MY ACCOUNT
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/account" className="hover:text-[#1868b7] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#1868b7] transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#1868b7] transition-colors">
                  Addresses
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#1868b7] transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#1868b7] transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#1868b7] transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#1868b7] transition-colors">
                  Compare Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3.5">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/info/emi-policy" className="hover:text-[#1868b7] transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/info/help-center" className="hover:text-[#1868b7] transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/info/corporate-orders" className="hover:text-[#1868b7] transition-colors">
                  How To Shop On Mrtom shop
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-[#1868b7] transition-colors">
                  Featured Recommendation
                </Link>
              </li>
              <li>
                <Link href="/info/returns-policy" className="hover:text-[#1868b7] transition-colors">
                  Cancellation, Return &amp; Refund (বাতিলকরণ এবং ফেরত)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright + Payment Logos Strip */}
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1360px] flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 text-xs text-slate-500">
            <p>Mrtom shop Pvt Ltd</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span>We&apos;re using safe payment for</span>
              <img
                src={OTHOBA_STATIC.paymentStrip}
                alt="bKash, VISA, Mastercard, American Express, Nagad, Upay"
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
