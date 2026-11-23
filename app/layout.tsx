import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import AppDealsModal from '@/components/AppDealsModal';
import CartDrawer from '@/components/CartDrawer';
import EmiModal from '@/components/EmiModal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import { StoreProvider } from '@/components/StoreProvider';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Mrtom shop — Online Shopping in Bangladesh | Electronics, Groceries & More',
  description:
    'Hassle-free online shopping in Bangladesh on Mrtom shop — Electronics, Groceries, Furniture, Home Appliances, Beauty, Toys, Fashion & Daily Essentials.',
  openGraph: {
    title: 'Mrtom shop — Online Shopping in Bangladesh',
    description:
      'Hassle-free online shopping in Bangladesh on Mrtom shop — Electronics, Groceries, Furniture, Home Appliances, Beauty, Toys, Fashion & Daily Essentials.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mrtom shop — Online Shopping in Bangladesh',
    description:
      'Hassle-free online shopping in Bangladesh on Mrtom shop — Electronics, Groceries, Furniture, Home Appliances, Beauty, Toys, Fashion & Daily Essentials.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#f5f6f8] text-[#222222]" suppressHydrationWarning>
        <StoreProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <EmiModal />
          <AppDealsModal />
        </StoreProvider>
      </body>
    </html>
  );
}
