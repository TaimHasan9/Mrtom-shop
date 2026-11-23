import type {
  CartItem,
  DeliveryAreaId,
  PaymentMethod,
  Product,
  ProductReview,
} from './types';

export interface DeliveryArea {
  id: DeliveryAreaId;
  division: string;
  label: string;
  fee: number;
  eta: string;
}

export const DELIVERY_AREAS: DeliveryArea[] = [
  { id: 'dhaka-north', division: 'Dhaka', label: 'Dhaka City North', fee: 60, eta: '1-2 working days' },
  { id: 'dhaka-south', division: 'Dhaka', label: 'Dhaka City South', fee: 60, eta: '1-2 working days' },
  { id: 'chattogram', division: 'Chattogram', label: 'Chattogram Metro', fee: 120, eta: '2-4 working days' },
  { id: 'sylhet', division: 'Sylhet', label: 'Sylhet City', fee: 120, eta: '3-5 working days' },
  { id: 'rajshahi', division: 'Rajshahi', label: 'Rajshahi City', fee: 120, eta: '3-5 working days' },
  { id: 'khulna', division: 'Khulna', label: 'Khulna City', fee: 120, eta: '3-5 working days' },
  { id: 'barishal', division: 'Barishal', label: 'Barishal City', fee: 130, eta: '3-6 working days' },
  { id: 'rangpur', division: 'Rangpur', label: 'Rangpur City', fee: 130, eta: '3-6 working days' },
  { id: 'mymensingh', division: 'Mymensingh', label: 'Mymensingh City', fee: 110, eta: '2-4 working days' },
];

export interface ProductFilterOptions {
  category?: string;
  subcategory?: string;
  brand?: string;
  seller?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  emiOnly?: boolean;
  freeDeliveryOnly?: boolean;
  tag?: Product['tags'][number];
  sort?: 'position' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount';
}

function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemToken(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.length > 4 && token.endsWith('es')) {
    return token.slice(0, -2);
  }
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
}

const SEARCH_SYNONYMS: Record<string, string[]> = {
  phone: ['mobile', 'smartphone', 'iphone', 'android'],
  mobile: ['phone', 'smartphone', 'iphone'],
  smartphone: ['mobile', 'phone'],
  geyser: ['water heater', 'heater'],
  heater: ['geyser', 'water heater'],
  tv: ['television', 'smart tv', 'led tv'],
  television: ['tv', 'smart tv'],
  ac: ['air conditioner', 'inverter ac'],
  fridge: ['refrigerator', 'freezer'],
  refrigerator: ['fridge', 'freezer'],
  earphone: ['earbuds', 'headphone', 'tws'],
  headphone: ['earphone', 'earbuds', 'headset'],
  earbuds: ['earphone', 'tws', 'headphone'],
  laptop: ['notebook', 'ultrabook', 'macbook'],
  watch: ['smartwatch', 'wrist watch'],
  smartwatch: ['smart watch', 'watch'],
  airfryer: ['air fryer'],
  ricecooker: ['rice cooker'],
  cooker: ['rice cooker', 'pressure cooker', 'induction', 'infrared'],
};

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  let result = products.slice();

  if (options.category) {
    const rawCat = options.category.toLowerCase();
    const aliasMap: Record<string, string> = {
      'mobiles-tablets-2': 'mobiles-tablets',
      'groceries-4': 'groceries',
      'furniture-7': 'furniture',
      regal: 'furniture',
      'disposable-diapers-3': 'diapers-baby',
      diapers: 'diapers-baby',
      'kitchen-dining-4': 'kitchen-dining',
      'beauty-personal-care-4': 'beauty-personal-care',
      'toys-games-2': 'toys-games',
      'home-decor-7': 'home-decor',
      'pet-supplies-7': 'pet-supplies',
      'home-appliances-6': 'home-appliances',
      'rfl-geyser-hub-store': 'home-appliances',
      'clothing-shoes-accessories-4': 'clothing-shoes-accessories',
      'sports-outdoors-4': 'sports-outdoors',
      'home-living-6': 'home-living',
      'automotive-motorcycles-3': 'automotive-motorcycles',
    };
    const cat = aliasMap[rawCat] ?? rawCat;
    result = result.filter((p) => p.categorySlug.toLowerCase() === cat);
  }

  if (options.subcategory) {
    const sub = options.subcategory.toLowerCase();
    result = result.filter((p) => p.subcategorySlug.toLowerCase() === sub);
  }

  if (options.brand) {
    const brands = options.brand.split(',').map((b) => b.trim().toLowerCase()).filter(Boolean);
    if (brands.length > 0) {
      result = result.filter((p) => brands.includes(p.brand.toLowerCase()));
    }
  }

  if (options.seller) {
    const seller = options.seller.toLowerCase();
    result = result.filter((p) => p.sellerSlug.toLowerCase() === seller);
  }

  let searchScores: Map<string, number> | null = null;
  if (options.q && options.q.trim().length > 0) {
    const normalizedQ = normalizeSearchText(options.q);
    const compactQ = normalizedQ.replace(/\s+/g, '');
    const rawTerms = normalizedQ.split(' ').filter(Boolean);

    if (rawTerms.length > 0) {
      const termVariants = rawTerms.map((term) => {
        const stem = stemToken(term);
        const syns = SEARCH_SYNONYMS[term] ?? SEARCH_SYNONYMS[stem] ?? [];
        return Array.from(new Set([term, stem, ...syns]));
      });

      const scoredStrict: Array<{ product: Product; score: number }> = [];
      const scoredPartial: Array<{ product: Product; score: number; matched: number }> = [];

      for (const p of result) {
        const specText = (p.specs ?? []).map((s) => `${s.label} ${s.value}`).join(' ');
        const hayRaw = `${p.name} ${p.brand} ${p.categoryName} ${p.subcategoryName} ${p.sellerName} ${p.sku} ${p.shortDescription} ${specText}`;
        const hay = normalizeSearchText(hayRaw);
        const hayCompact = hay.replace(/\s+/g, '');
        const titleNorm = normalizeSearchText(p.name);

        let matchedCount = 0;
        let score = 0;

        if (compactQ.length >= 3 && hayCompact.includes(compactQ)) {
          score += 30;
        }
        if (titleNorm.includes(normalizedQ)) {
          score += 50;
        }

        for (const variants of termVariants) {
          let hit = false;
          for (const v of variants) {
            if (hay.includes(v) || (v.length >= 4 && hayCompact.includes(v.replace(/\s+/g, '')))) {
              hit = true;
              if (titleNorm.includes(v)) score += 12;
              else if (normalizeSearchText(p.brand).includes(v)) score += 8;
              else score += 4;
              break;
            }
          }
          if (hit) matchedCount += 1;
        }

        if (matchedCount === termVariants.length || (compactQ.length >= 4 && hayCompact.includes(compactQ))) {
          scoredStrict.push({ product: p, score });
        } else if (termVariants.length > 1 && matchedCount > 0) {
          scoredPartial.push({ product: p, score, matched: matchedCount });
        }
      }

      if (scoredStrict.length >= 6 || scoredPartial.length === 0) {
        result = scoredStrict.map((x) => x.product);
        searchScores = new Map(scoredStrict.map((x) => [x.product.id, x.score]));
      } else {
        scoredPartial.sort((a, b) => b.matched - a.matched || b.score - a.score);
        const merged = [...scoredStrict.map((x) => ({ id: x.product.id, product: x.product, score: x.score + 100 }))];
        const seenIds = new Set(merged.map((m) => m.id));
        for (const item of scoredPartial) {
          if (!seenIds.has(item.product.id)) {
            merged.push({ id: item.product.id, product: item.product, score: item.score });
            seenIds.add(item.product.id);
          }
        }
        result = merged.map((m) => m.product);
        searchScores = new Map(merged.map((m) => [m.id, m.score]));
      }
    }
  }

  if (typeof options.minPrice === 'number' && !Number.isNaN(options.minPrice)) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }

  if (typeof options.maxPrice === 'number' && !Number.isNaN(options.maxPrice)) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  if (typeof options.minRating === 'number' && options.minRating > 0) {
    result = result.filter((p) => p.rating >= options.minRating!);
  }

  if (options.emiOnly) {
    result = result.filter((p) => Boolean(p.emiMonths && p.emiMonths > 0));
  }

  if (options.freeDeliveryOnly) {
    result = result.filter((p) => Boolean(p.freeDelivery));
  }

  if (options.tag) {
    result = result.filter((p) => p.tags.includes(options.tag!));
  }

  switch (options.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'discount':
      result.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case 'newest':
      result.sort((a, b) => (b.tags.includes('new-arrival') ? 1 : 0) - (a.tags.includes('new-arrival') ? 1 : 0));
      break;
    case 'position':
    default:
      if (searchScores) {
        result.sort(
          (a, b) =>
            (searchScores!.get(b.id) ?? 0) - (searchScores!.get(a.id) ?? 0) ||
            b.soldCount - a.soldCount
        );
      } else {
        result.sort((a, b) => b.soldCount - a.soldCount);
      }
      break;
  }

  return result;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  originalSubtotal: number;
  productSavings: number;
  couponDiscount: number;
  appliedCoupon: string | null;
  couponMessage: string | null;
  shippingFee: number;
  total: number;
}

export function calculateCartTotals(
  items: CartItem[],
  areaId: DeliveryAreaId = 'dhaka-north',
  couponCode?: string
): CartTotals {
  const itemCount = items.reduce((acc, item) => acc + Math.max(0, item.quantity), 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * Math.max(0, item.quantity), 0);
  const originalSubtotal = items.reduce(
    (acc, item) => acc + Math.max(item.originalPrice, item.price) * Math.max(0, item.quantity),
    0
  );
  const productSavings = Math.max(0, originalSubtotal - subtotal);

  const area = DELIVERY_AREAS.find((a) => a.id === areaId) ?? DELIVERY_AREAS[0];
  const allFreeShipping = items.length > 0 && items.every((i) => i.freeDelivery);
  let shippingFee = items.length === 0 ? 0 : allFreeShipping || subtotal >= 3000 ? 0 : area.fee;

  let couponDiscount = 0;
  let appliedCoupon: string | null = null;
  let couponMessage: string | null = null;

  const code = (couponCode ?? '').trim().toUpperCase();
  if (code && items.length > 0) {
    if (code === 'MRTOM10' || code === 'OTHOBA10') {
      couponDiscount = Math.min(1000, Math.round(subtotal * 0.1));
      appliedCoupon = code;
      couponMessage = '10% discount applied (up to Tk 1,000)';
    } else if (code === 'WELCOME150') {
      if (subtotal >= 1500) {
        couponDiscount = 150;
        appliedCoupon = 'WELCOME150';
        couponMessage = 'Tk 150 welcome discount applied';
      } else {
        couponMessage = 'WELCOME150 requires minimum order of Tk 1,500';
      }
    } else if (code === 'FREESHIP') {
      shippingFee = 0;
      appliedCoupon = 'FREESHIP';
      couponMessage = 'Free shipping applied';
    } else {
      couponMessage = 'Invalid coupon code. Try MRTOM10, WELCOME150, or FREESHIP';
    }
  }

  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  return {
    itemCount,
    subtotal,
    originalSubtotal,
    productSavings,
    couponDiscount,
    appliedCoupon,
    couponMessage,
    shippingFee,
    total,
  };
}

export function calculateEmiMonthly(price: number, months: number): number {
  if (price <= 0 || months <= 0) return 0;
  return Math.round((price / months) * 100) / 100;
}

export function formatTk(amount: number): string {
  const rounded = Math.round(amount);
  return `Tk ${rounded.toLocaleString('en-US')}`;
}

export function computeReviewSummary(reviews: ProductReview[]): {
  averageRating: number;
  reviewCount: number;
} {
  if (reviews.length === 0) return { averageRating: 0, reviewCount: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export interface CheckoutInput {
  customerName: string;
  phone: string;
  email?: string;
  areaId: DeliveryAreaId;
  address: string;
  paymentMethod: PaymentMethod;
}

export function validateCheckoutInput(input: CheckoutInput): {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutInput, string>>;
} {
  const errors: Partial<Record<keyof CheckoutInput, string>> = {};

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Please enter your full name (at least 2 characters).';
  }

  const cleanPhone = (input.phone ?? '').replace(/[\s-]/g, '');
  if (!/^(\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
    errors.phone = 'Enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).';
  }

  if (input.email && input.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!DELIVERY_AREAS.some((a) => a.id === input.areaId)) {
    errors.areaId = 'Please select a valid delivery area.';
  }

  if (!input.address || input.address.trim().length < 8) {
    errors.address = 'Please enter your complete street address / house & road details.';
  }

  if (!['cod', 'bkash', 'nagad', 'card'].includes(input.paymentMethod)) {
    errors.paymentMethod = 'Please choose a payment method.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
