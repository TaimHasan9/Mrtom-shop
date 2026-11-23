import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, PhoneCall, ShieldCheck } from 'lucide-react';

interface PolicyDoc {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
}

const INFO_DOCS: Record<string, PolicyDoc> = {
  'returns-policy': {
    title: 'Cancellation & Returns Policy',
    subtitle: '7-day easy return & replacement guarantee on eligible Mrtom shop purchases.',
    sections: [
      {
        heading: 'Eligible Reasons for Return',
        body: 'Items delivered damaged, defective, incomplete, or mismatched from the product description may be returned within 7 calendar days of delivery with original packaging and invoice.',
      },
      {
        heading: 'Order Cancellation',
        body: 'Orders may be cancelled prior to dispatch by calling Hotline 09613-800800 or via your order confirmation receipt. Prepaid cancellations are refunded within 5-7 working days.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy & Buyer Protection Policy',
    subtitle: 'How Mrtom shop safeguards your personal, address, and payment details.',
    sections: [
      {
        heading: 'Data Privacy & Security',
        body: 'We collect only the contact, shipping, and order details required to fulfill your purchases and deliver parcel updates across Bangladesh. Payment credentials are handled exclusively through encrypted channels.',
      },
      {
        heading: '100% Authentic Product Guarantee',
        body: 'All flagship mall items from RFL, VISION, Regal, Daily Shopping, and Realme carry genuine manufacturer guarantees.',
      },
    ],
  },
  'emi-policy': {
    title: '0% EMI Installment Policy',
    subtitle: 'Split purchases of Tk 5,000 or more into 3 to 36 monthly installments.',
    sections: [
      {
        heading: 'How 0% EMI Works',
        body: 'Select eligible Visa, Mastercard, or American Express credit cards from partner Bangladesh banks (BRAC Bank, City Bank, EBL, DBBL, Prime Bank, Standard Chartered) qualify for 0% interest EMI.',
      },
      {
        heading: 'Using EMI Calculator',
        body: 'On any eligible product page, click "View Plans" next to the EMI section to preview exact monthly installments before adding to cart.',
      },
    ],
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Rates',
    subtitle: 'Fast doorstep delivery across Dhaka and all 64 districts of Bangladesh.',
    sections: [
      {
        heading: 'Standard Delivery Timelines',
        body: 'Dhaka City North & South orders deliver within 1-2 working days (Tk 60, free on orders Tk 3,000+). Outside Dhaka metro areas deliver within 2-5 working days (Tk 110 - Tk 130).',
      },
      {
        heading: 'Coupon Code FREESHIP',
        body: 'Apply coupon code FREESHIP in your Shopping Cart for free delivery regardless of order value.',
      },
    ],
  },
  'warranty-policy': {
    title: 'Official Brand Warranty Coverage',
    subtitle: 'Manufacturer-backed warranty & service center support.',
    sections: [
      {
        heading: 'Claiming Warranty',
        body: 'Keep your Mrtom shop digital invoice from your Account Order History or Track Order page. Present it along with the brand warranty card at any authorized service center.',
      },
    ],
  },
  'help-center': {
    title: 'Customer Support & Help Center',
    subtitle: 'Our support specialists are available 9 AM - 9 PM daily.',
    sections: [
      {
        heading: 'Direct Hotline & Email',
        body: 'Call 09613-800800 or write to support@mrtomshop.com with your Order Number (e.g. OTH-2026-1042) for instant assistance with delivery tracking, refunds, or bulk orders.',
      },
      {
        heading: 'Coupon Codes Available',
        body: 'Try MRTOM10 (10% off up to Tk 1,000), WELCOME150 (Tk 150 off orders Tk 1,500+), or FREESHIP at your Cart page.',
      },
    ],
  },
  'about-us': {
    title: 'About Mrtom shop',
    subtitle: 'Bangladesh’s hassle-free online shopping destination — Live Easy.',
    sections: [
      {
        heading: 'Our Mission',
        body: 'Mrtom shop connects shoppers nationwide with trusted everyday groceries, home appliances, electronics, furniture, personal care, and official flagship stores with transparent pricing and dependable doorstep delivery.',
      },
    ],
  },
  careers: {
    title: 'Careers at Mrtom shop',
    subtitle: 'Build the future of digital commerce in Bangladesh.',
    sections: [
      {
        heading: 'Open Teams',
        body: 'We hire across Marketplace Operations, Logistics Fulfillment, Software Engineering, Category Management, and Customer Experience in Dhaka. Send inquiries to support@mrtomshop.com.',
      },
    ],
  },
  'corporate-orders': {
    title: 'Corporate & Bulk Procurement',
    subtitle: 'Volume pricing on office furniture, IT gear, appliances, and gift hampers.',
    sections: [
      {
        heading: 'Dedicated B2B Desk',
        body: 'Contact Hotline 09613-800800 for VAT-compliant corporate quotations, multi-branch delivery schedules, and dedicated account support.',
      },
    ],
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    subtitle: 'Marketplace usage guidelines for Mrtom shop buyers and sellers.',
    sections: [
      {
        heading: 'Pricing & Availability',
        body: 'All listed prices include applicable VAT where indicated. Promotional coupon codes apply subject to minimum basket thresholds shown in the Cart summary.',
      },
    ],
  },
};

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = INFO_DOCS[slug];
  if (!doc) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1160px] px-3 sm:px-6 py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1e5fa8]">
          Home
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">{doc.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-4 self-start space-y-1">
          <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Information &amp; Policies
          </p>
          {Object.entries(INFO_DOCS).map(([key, item]) => (
            <Link
              key={key}
              href={`/info/${key}`}
              className={`block rounded px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                key === slug
                  ? 'bg-[#1e5fa8] text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#1e5fa8]'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </aside>

        <article className="lg:col-span-8 rounded-lg border border-slate-200 bg-white p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{doc.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{doc.subtitle}</p>
          </div>

          <div className="space-y-5">
            {doc.sections.map((sec) => (
              <section key={sec.heading} className="space-y-1.5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1e5fa8]" />
                  {sec.heading}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">{sec.body}</p>
              </section>
            ))}
          </div>

          <div className="rounded-md bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-800">
              <PhoneCall size={18} className="text-[#1e5fa8]" />
              <span>
                Need help? Call <strong>09613-800800</strong> or track an existing parcel.
              </span>
            </div>
            <Link
              href="/track-order"
              className="rounded bg-[#1e5fa8] px-4 py-2 text-xs font-bold text-white hover:bg-[#164b87] whitespace-nowrap self-start sm:self-auto"
            >
              Track Order
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
