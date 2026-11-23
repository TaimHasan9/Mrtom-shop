export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export interface PromoBannerItem {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export const OTHOBA_STATIC = {
  logo: '/images/othoba/logo-othoba.png',
  paymentStrip: '/images/othoba/payment-strip.png',
  googlePlayBtn: '/images/othoba/btn-google-play.png',
  appStoreBtn: '/images/othoba/btn-app-store.png',
  appQr: '/images/othoba/qr-app.png',
  collectionPointSvg: '/images/othoba/collection-point.svg',
  appBanner: '/images/othoba/app-banner.jpeg',
  midAirFryerBanner: '/images/othoba/mid-airfryer.jpeg',
  groceryBanner: '/images/othoba/grocery-banner.jpeg',
};

export const OTHOBA_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/images/othoba/hero-1.jpeg',
    alt: 'RFL Electric Geyser Flat 16% Discount & Free Delivery',
    href: '/product/rfl-electric-geyser-glossy-45-liter',
  },
  {
    id: 'slide-2',
    image: '/images/othoba/hero-2.jpeg',
    alt: 'Lowest Price Ever on Philips Air Fryer',
    href: '/category/kitchen-dining',
  },
  {
    id: 'slide-3',
    image: '/images/othoba/hero-3.jpeg',
    alt: 'Winter Glow Mania Unilever Store',
    href: '/category/beauty-personal-care',
  },
  {
    id: 'slide-4',
    image: '/images/othoba/hero-4.jpeg',
    alt: 'Regal Furniture Comfort & Style Up to 15% Discount',
    href: '/category/furniture',
  },
  {
    id: 'slide-5',
    image: '/images/othoba/hero-5.jpeg',
    alt: 'Comfy Premium Comforter Collection',
    href: '/category/home-living',
  },
  {
    id: 'slide-6',
    image: '/images/othoba/hero-6.jpeg',
    alt: 'Pureit Water Purifier Official Campaign',
    href: '/category/home-appliances',
  },
  {
    id: 'slide-7',
    image: '/images/othoba/hero-7.png',
    alt: 'Duranta Bicycle Collection',
    href: '/category/sports-outdoors',
  },
  {
    id: 'slide-8',
    image: '/images/othoba/hero-8.jpeg',
    alt: 'Laundry & Detergent Super Saver Deals',
    href: '/category/groceries',
  },
  {
    id: 'slide-9',
    image: '/images/othoba/hero-9.jpeg',
    alt: 'bKash Payment 10% Instant Cashback',
    href: '/deals',
  },
];

// Matches live Othoba.com right-hand column layout: 2 full-width stacked top + 2 side-by-side bottom
export const OTHOBA_SIDE_TOP_BANNERS: PromoBannerItem[] = [
  {
    id: 'side-top-1',
    image: '/images/othoba/side-1.jpeg',
    alt: 'RFL Geyser Flat 16% Discount',
    href: '/product/rfl-electric-geyser-glossy-45-liter',
  },
  {
    id: 'side-top-2',
    image: '/images/othoba/side-2.jpeg',
    alt: 'Regal Furniture Up to 15% Discount',
    href: '/category/furniture',
  },
];

export const OTHOBA_SIDE_BOTTOM_BANNERS: PromoBannerItem[] = [
  {
    id: 'side-bot-1',
    image: '/images/othoba/side-3.png',
    alt: 'RFL Comfort Chair Flat 20% Off',
    href: '/category/furniture',
  },
  {
    id: 'side-bot-2',
    image: '/images/othoba/side-4.png',
    alt: 'Gorgeous Handicrafts Home Decor',
    href: '/category/home-decor',
  },
];

export const OTHOBA_PROMO_2COL: PromoBannerItem[] = [
  {
    id: 'promo-2col-1',
    image: '/images/othoba/promo-2col-1.png',
    alt: 'New Arrival Electronics & Gadgets',
    href: '/products?sort=newest',
  },
  {
    id: 'promo-2col-2',
    image: '/images/othoba/promo-2col-2.png',
    alt: 'RYDO Scratch & Win Electric Scooter',
    href: '/category/sports-outdoors',
  },
];

export const OTHOBA_PROMO_3COL: PromoBannerItem[] = [
  {
    id: 'promo-3col-1',
    image: '/images/othoba/promo-3col-1.png',
    alt: 'Harpic Lemon Freshness Cleaning Deals',
    href: '/category/groceries',
  },
  {
    id: 'promo-3col-2',
    image: '/images/othoba/promo-3col-2.jpeg',
    alt: 'Best Price Challenge on Televisions',
    href: '/category/tv-audio-gaming-wearables',
  },
  {
    id: 'promo-3col-3',
    image: '/images/othoba/promo-3col-3.png',
    alt: 'Gorgeous Handicrafts Jute & Decor',
    href: '/category/home-decor',
  },
];
