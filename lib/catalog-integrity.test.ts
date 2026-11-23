import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_PRODUCTS, CATEGORIES } from './catalog';
import {
  addQuestionToProduct,
  addReviewToProduct,
  getEnrichedProductBySlug,
  getOrCreateSession,
  placeOrderFromSession,
} from './server-store';

test('all 24 synced Othoba categories have >= 15 distinct real products with valid images', () => {
  assert.equal(CATEGORIES.length, 24);
  assert.ok(ALL_PRODUCTS.length >= 1900, `Expected >= 1900 real Othoba products, got ${ALL_PRODUCTS.length}`);

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const cat of CATEGORIES) {
    const items = ALL_PRODUCTS.filter((p) => p.categorySlug === cat.slug);
    assert.ok(
      items.length >= 15,
      `Expected category "${cat.name}" (${cat.slug}) to have >= 15 products, got ${items.length}`
    );
  }

  for (const p of ALL_PRODUCTS) {
    assert.ok(!seenIds.has(p.id), `Duplicate product id: ${p.id}`);
    assert.ok(!seenSlugs.has(p.slug), `Duplicate product slug: ${p.slug}`);
    seenIds.add(p.id);
    seenSlugs.add(p.slug);

    assert.ok(p.price > 0, `Expected positive price for ${p.slug}, got ${p.price}`);
    if (p.image.startsWith('/')) {
      const diskPath = path.join(process.cwd(), 'public', p.image.replace(/^\//, ''));
      assert.ok(fs.existsSync(diskPath), `Missing local image asset for ${p.slug}: ${diskPath}`);
    } else {
      assert.ok(
        p.image.startsWith('https://images.othoba.com/') || p.image.startsWith('https://othoba.com/'),
        `Invalid remote image URL for ${p.slug}: ${p.image}`
      );
    }
  }
});

test('every Othoba static asset referenced on home and PDP exists locally', () => {
  const requiredAssets = [
    'logo-othoba.png',
    'payment-strip.png',
    'btn-google-play.png',
    'btn-app-store.png',
    'qr-app.png',
    'collection-point.svg',
    'app-banner.jpeg',
    'mid-airfryer.jpeg',
    'hero-1.jpeg',
    'side-1.jpeg',
    'promo-2col-1.png',
    'promo-3col-1.png',
    'brand-rfl.jpeg',
  ];
  for (const asset of requiredAssets) {
    const p = path.join(process.cwd(), 'public', 'images', 'othoba', asset);
    assert.ok(fs.existsSync(p), `Missing Othoba static asset: ${p}`);
  }
});

test('server-store supports reviews, Q&A, and order placement end-to-end', async () => {
  const targetSlug = 'rfl-electric-geyser-glossy-45-liter';
  const before = getEnrichedProductBySlug(targetSlug);
  assert.ok(before, 'Expected friendly alias lookup for rfl-electric-geyser-glossy-45-liter');

  const rev = addReviewToProduct(targetSlug, {
    author: 'Verification Tester',
    rating: 5,
    comment: 'Heats water quickly and fits nicely on the bathroom wall.',
  });
  assert.ok(rev);

  const qa = addQuestionToProduct(targetSlug, {
    author: 'Buyer BD',
    question: 'Does it include installation bracket in the box?',
  });
  assert.ok(qa);

  const after = getEnrichedProductBySlug(targetSlug);
  assert.ok(after);
  assert.ok(after.reviews.some((r) => r.id === rev.id));
  assert.ok(after.questions.some((q) => q.id === qa.id));

  const { session } = await getOrCreateSession('test-session-checkout');
  session.cart = [
    {
      productId: before.id,
      slug: before.slug,
      name: before.name,
      image: before.image,
      price: before.price,
      originalPrice: before.originalPrice,
      quantity: 1,
      freeDelivery: before.freeDelivery,
      sellerName: before.sellerName,
    },
  ];
  session.couponCode = 'OTHOBA10';

  const badOrder = placeOrderFromSession(session, {
    customerName: 'A',
    phone: '123',
    areaId: 'dhaka-north',
    address: 'Short',
    paymentMethod: 'cod',
  });
  assert.equal(badOrder.ok, false);

  const goodOrder = placeOrderFromSession(session, {
    customerName: 'Nusrat Jahan',
    phone: '01711223344',
    areaId: 'dhaka-north',
    address: 'House 12, Road 5, Dhanmondi, Dhaka',
    paymentMethod: 'bkash',
  });
  assert.equal(goodOrder.ok, true);
  if (goodOrder.ok) {
    assert.ok(goodOrder.order.orderNumber.startsWith('OTH-2026-'));
    assert.equal(session.cart.length, 0);
  }
});
