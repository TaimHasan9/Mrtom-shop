import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateEmiMonthly,
  computeReviewSummary,
  filterAndSortProducts,
  validateCheckoutInput,
} from './store-logic';
import type { CartItem, Product } from './types';

const mockProducts: Product[] = [
  {
    id: 'p1',
    sku: 'SKU-1',
    name: 'RFL Electric Geyser 45L',
    slug: 'rfl-electric-geyser-45l',
    categorySlug: 'home-appliances',
    categoryName: 'Home Appliances',
    subcategorySlug: 'geysers-water-heaters',
    subcategoryName: 'Geysers & Water Heaters',
    brand: 'RFL',
    sellerSlug: 'rfl-geyser-hub',
    sellerName: 'RFL Geyser Hub Store',
    price: 8383,
    originalPrice: 9980,
    discountPercent: 16,
    appPrice: 7764,
    rating: 4.8,
    reviewCount: 5,
    soldCount: 240,
    inStock: true,
    stockCount: 30,
    image: '/images/products/home_appliances/2.jpg',
    gallery: ['/images/products/home_appliances/2.jpg'],
    shortDescription: '45L ceiling mounted electric water heater.',
    description: '45L ceiling mounted electric water heater with 2 years warranty.',
    specs: [{ label: 'Capacity', value: '45L' }],
    emiMonths: 3,
    freeDelivery: true,
    nextDayDelivery: true,
    codAvailable: true,
    tags: ['hot-deal', 'featured'],
    reviews: [],
    questions: [],
  },
  {
    id: 'p2',
    sku: 'SKU-2',
    name: 'PRAN Minicate Rice 5kg',
    slug: 'pran-minicate-rice-5kg',
    categorySlug: 'groceries',
    categoryName: 'Groceries',
    subcategorySlug: 'rice-grains',
    subcategoryName: 'Rice & Grains',
    brand: 'PRAN',
    sellerSlug: 'daily-shopping',
    sellerName: 'Daily Shopping',
    price: 450,
    originalPrice: 470,
    discountPercent: 4,
    appPrice: 435,
    rating: 4.5,
    reviewCount: 2,
    soldCount: 890,
    inStock: true,
    stockCount: 150,
    image: '/images/products/groceries/1.jpg',
    gallery: ['/images/products/groceries/1.jpg'],
    shortDescription: 'Premium sorted 5kg Minicate rice.',
    description: 'Clean aromatic Minicate rice.',
    specs: [{ label: 'Weight', value: '5kg' }],
    freeDelivery: false,
    codAvailable: true,
    tags: ['trending', 'best-seller'],
    reviews: [],
    questions: [],
  },
];

test('filterAndSortProducts filters by category, search query (including stemming & synonyms), and sorts by price ascending', () => {
  const byCategory = filterAndSortProducts(mockProducts, { category: 'home-appliances' });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].slug, 'rfl-electric-geyser-45l');

  const byQuery = filterAndSortProducts(mockProducts, { q: 'minicate pran' });
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].slug, 'pran-minicate-rice-5kg');

  const bySynonym = filterAndSortProducts(mockProducts, { q: 'water heaters' });
  assert.equal(bySynonym.length, 1);
  assert.equal(bySynonym[0].slug, 'rfl-electric-geyser-45l');

  const byPlural = filterAndSortProducts(mockProducts, { q: 'geysers' });
  assert.equal(byPlural.length, 1);
  assert.equal(byPlural[0].slug, 'rfl-electric-geyser-45l');

  const sorted = filterAndSortProducts(mockProducts, { sort: 'price-asc' });
  assert.equal(sorted[0].price, 450);
  assert.equal(sorted[1].price, 8383);
});

test('calculateCartTotals computes shipping threshold, coupons (MRTOM10 & OTHOBA10), and product savings', () => {
  const riceItem: CartItem = {
    productId: 'p2',
    slug: 'pran-minicate-rice-5kg',
    name: 'PRAN Minicate Rice 5kg',
    image: '/images/products/groceries/1.jpg',
    price: 450,
    originalPrice: 470,
    quantity: 2,
    freeDelivery: false,
    sellerName: 'Daily Shopping',
  };

  const underThreshold = calculateCartTotals([riceItem], 'dhaka-north');
  assert.equal(underThreshold.subtotal, 900);
  assert.equal(underThreshold.shippingFee, 60);
  assert.equal(underThreshold.total, 960);

  const withMrtomCoupon = calculateCartTotals([riceItem], 'dhaka-north', 'MRTOM10');
  assert.equal(withMrtomCoupon.couponDiscount, 90);
  assert.equal(withMrtomCoupon.appliedCoupon, 'MRTOM10');
  assert.equal(withMrtomCoupon.total, 870);

  const withLegacyCoupon = calculateCartTotals([riceItem], 'dhaka-north', 'OTHOBA10');
  assert.equal(withLegacyCoupon.couponDiscount, 90);
  assert.equal(withLegacyCoupon.appliedCoupon, 'OTHOBA10');
  assert.equal(withLegacyCoupon.total, 870);

  const withFreeShip = calculateCartTotals([riceItem], 'chattogram', 'FREESHIP');
  assert.equal(withFreeShip.shippingFee, 0);
  assert.equal(withFreeShip.total, 900);
});

test('validateCheckoutInput rejects invalid Bangladesh phone and accepts valid input', () => {
  const bad = validateCheckoutInput({
    customerName: 'A',
    phone: '12345',
    areaId: 'dhaka-north',
    address: 'Short',
    paymentMethod: 'cod',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.customerName);
  assert.ok(bad.errors.phone);
  assert.ok(bad.errors.address);

  const good = validateCheckoutInput({
    customerName: 'Tariqul Islam',
    phone: '01712345678',
    email: 'tariqul@example.com',
    areaId: 'dhaka-north',
    address: 'House 18, Road 4, Banani, Dhaka 1213',
    paymentMethod: 'bkash',
  });
  assert.equal(good.valid, true);
});

test('calculateEmiMonthly and computeReviewSummary return accurate metrics', () => {
  assert.equal(calculateEmiMonthly(8383, 3), 2794.33);
  const summary = computeReviewSummary([
    { id: '1', author: 'A', rating: 5, comment: 'Great', createdAt: '2026-11-01', verifiedPurchase: true },
    { id: '2', author: 'B', rating: 4, comment: 'Good', createdAt: '2026-11-02', verifiedPurchase: true },
  ]);
  assert.equal(summary.averageRating, 4.5);
  assert.equal(summary.reviewCount, 2);
});
