import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { ALL_PRODUCTS, getProductBySlug } from './catalog';
import { computeReviewSummary, DELIVERY_AREAS, validateCheckoutInput, calculateCartTotals } from './store-logic';
import type {
  CartItem,
  DeliveryAreaId,
  Order,
  PaymentMethod,
  Product,
  ProductQuestion,
  ProductReview,
  UserProfile,
} from './types';

export const SESSION_COOKIE_NAME = 'othoba_session';

export interface StoredUser extends UserProfile {
  password: string;
}

export interface SessionState {
  id: string;
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  areaId: DeliveryAreaId;
  couponCode: string;
  userId: string | null;
}

export interface SellerApplication {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  createdAt: string;
}

interface GlobalStoreData {
  sessions: Map<string, SessionState>;
  users: Map<string, StoredUser>;
  orders: Map<string, Order>;
  userOrders: Map<string, string[]>;
  customReviews: Map<string, ProductReview[]>;
  customQuestions: Map<string, ProductQuestion[]>;
  liveProducts: Map<string, Product>;
  newsletterSubscribers: Set<string>;
  sellerApplications: SellerApplication[];
  orderSeq: number;
}

declare global {
  var __othobaServerStore: GlobalStoreData | undefined;
}

function createInitialStore(): GlobalStoreData {
  const users = new Map<string, StoredUser>();
  const demoUser: StoredUser = {
    id: 'user-demo-1',
    name: 'Tariqul Islam',
    email: 'tariqul@example.com',
    phone: '01712345678',
    password: 'password123',
    defaultAreaId: 'dhaka-north',
    defaultAddress: 'House 24, Road 11, Banani, Dhaka 1213',
  };
  users.set(demoUser.id, demoUser);

  const orders = new Map<string, Order>();
  const firstGeyser = ALL_PRODUCTS.find((p) => p.slug.includes('geyser')) ?? ALL_PRODUCTS[0];
  const secondGroceries = ALL_PRODUCTS.find((p) => p.categorySlug === 'groceries') ?? ALL_PRODUCTS[1];
  const thirdMobile = ALL_PRODUCTS.find((p) => p.categorySlug === 'mobiles-tablets') ?? ALL_PRODUCTS[2];

  const order1: Order = {
    orderNumber: 'OTH-2026-1041',
    createdAt: '2026-11-18T10:30:00.000Z',
    status: 'Delivered',
    customerName: 'Tariqul Islam',
    phone: '01712345678',
    email: 'tariqul@example.com',
    areaId: 'dhaka-north',
    areaLabel: 'Dhaka City North',
    address: 'House 24, Road 11, Banani, Dhaka 1213',
    paymentMethod: 'bkash',
    subtotal: firstGeyser.price,
    couponDiscount: 0,
    shippingFee: 0,
    total: firstGeyser.price,
    items: [
      {
        productId: firstGeyser.id,
        slug: firstGeyser.slug,
        name: firstGeyser.name,
        image: firstGeyser.image,
        price: firstGeyser.price,
        quantity: 1,
        selectedVariant: firstGeyser.variants?.[0]?.options[0],
      },
    ],
    estimatedDelivery: 'Delivered on 20 Nov 2026',
  };

  const order2: Order = {
    orderNumber: 'OTH-2026-1042',
    createdAt: '2026-11-22T09:15:00.000Z',
    status: 'Out for Delivery',
    customerName: 'Tariqul Islam',
    phone: '01712345678',
    email: 'tariqul@example.com',
    areaId: 'dhaka-north',
    areaLabel: 'Dhaka City North',
    address: 'House 24, Road 11, Banani, Dhaka 1213',
    paymentMethod: 'cod',
    couponCode: 'OTHOBA10',
    subtotal: secondGroceries.price * 2 + thirdMobile.price,
    couponDiscount: 1000,
    shippingFee: 0,
    total: Math.max(0, secondGroceries.price * 2 + thirdMobile.price - 1000),
    items: [
      {
        productId: thirdMobile.id,
        slug: thirdMobile.slug,
        name: thirdMobile.name,
        image: thirdMobile.image,
        price: thirdMobile.price,
        quantity: 1,
        selectedVariant: thirdMobile.variants?.[0]?.options[0],
      },
      {
        productId: secondGroceries.id,
        slug: secondGroceries.slug,
        name: secondGroceries.name,
        image: secondGroceries.image,
        price: secondGroceries.price,
        quantity: 2,
      },
    ],
    estimatedDelivery: '1-2 working days',
  };

  orders.set(order1.orderNumber, order1);
  orders.set(order2.orderNumber, order2);

  const userOrders = new Map<string, string[]>();
  userOrders.set(demoUser.id, [order2.orderNumber, order1.orderNumber]);

  return {
    sessions: new Map(),
    users,
    orders,
    userOrders,
    customReviews: new Map(),
    customQuestions: new Map(),
    liveProducts: new Map(),
    newsletterSubscribers: new Set(),
    sellerApplications: [],
    orderSeq: 1043,
  };
}

export function getStore(): GlobalStoreData {
  if (!globalThis.__othobaServerStore) {
    globalThis.__othobaServerStore = createInitialStore();
  }
  if (!globalThis.__othobaServerStore.liveProducts) {
    globalThis.__othobaServerStore.liveProducts = new Map();
  }
  return globalThis.__othobaServerStore;
}

export function registerLiveProducts(items: Product[]): void {
  const store = getStore();
  for (const p of items) {
    if (!getProductBySlug(p.slug)) {
      store.liveProducts.set(p.slug.toLowerCase(), p);
    }
  }
}

export function findAnyProduct(idOrSlug: string): Product | undefined {
  const byStaticSlug = getProductBySlug(idOrSlug);
  if (byStaticSlug) return byStaticSlug;
  const lower = idOrSlug.toLowerCase();
  const byId = ALL_PRODUCTS.find((p) => p.id.toLowerCase() === lower);
  if (byId) return byId;

  const store = getStore();
  const fromLive = store.liveProducts.get(lower);
  if (fromLive) return fromLive;
  for (const lp of store.liveProducts.values()) {
    if (lp.id.toLowerCase() === lower || lp.slug.toLowerCase() === lower) {
      return lp;
    }
  }
  return undefined;
}

export async function getOrCreateSession(cookieSessionId?: string): Promise<{
  session: SessionState;
  isNew: boolean;
}> {
  const store = getStore();
  let sid = cookieSessionId;
  if (!sid) {
    const cookieStore = await cookies();
    sid = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (sid && store.sessions.has(sid)) {
    return { session: store.sessions.get(sid)!, isNew: false };
  }

  const newId = sid || crypto.randomUUID();
  const session: SessionState = {
    id: newId,
    cart: [],
    wishlist: [],
    compare: [],
    areaId: 'dhaka-north',
    couponCode: '',
    userId: null,
  };
  store.sessions.set(newId, session);
  return { session, isNew: true };
}

export function enrichProduct(product: Product): Product {
  const store = getStore();
  const extraReviews = store.customReviews.get(product.slug) ?? [];
  const extraQuestions = store.customQuestions.get(product.slug) ?? [];

  if (extraReviews.length === 0 && extraQuestions.length === 0) {
    return product;
  }

  const reviews = [...extraReviews, ...product.reviews];
  const questions = [...extraQuestions, ...product.questions];
  const summary = computeReviewSummary(reviews);

  return {
    ...product,
    reviews,
    questions,
    rating: summary.reviewCount > 0 ? summary.averageRating : product.rating,
    reviewCount: Math.max(product.reviewCount + extraReviews.length, summary.reviewCount),
  };
}

export function getEnrichedProductBySlug(slug: string): Product | undefined {
  const base = findAnyProduct(slug);
  if (!base) return undefined;
  return enrichProduct(base);
}

export function getEnrichedProducts(): Product[] {
  const store = getStore();
  const combined = [...ALL_PRODUCTS];
  if (store.liveProducts.size > 0) {
    const existingIds = new Set(combined.map((p) => p.id));
    for (const lp of store.liveProducts.values()) {
      if (!existingIds.has(lp.id)) {
        combined.push(lp);
      }
    }
  }
  return combined.map(enrichProduct);
}

export function addReviewToProduct(
  slug: string,
  input: { author: string; rating: number; comment: string }
): ProductReview | null {
  const base = findAnyProduct(slug);
  if (!base) return null;
  const store = getStore();
  const list = store.customReviews.get(base.slug) ?? [];
  const review: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: input.author.trim(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
    verifiedPurchase: true,
  };
  list.unshift(review);
  store.customReviews.set(base.slug, list);
  return review;
}

export function addQuestionToProduct(
  slug: string,
  input: { author: string; question: string }
): ProductQuestion | null {
  const base = findAnyProduct(slug);
  if (!base) return null;
  const store = getStore();
  const list = store.customQuestions.get(base.slug) ?? [];
  const qa: ProductQuestion = {
    id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: input.author.trim(),
    question: input.question.trim(),
    answer: `Thank you for asking! This ${base.brand} product is 100% genuine from ${base.sellerName} with ${base.warranty ?? 'official support'} and nationwide delivery across Bangladesh.`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  list.unshift(qa);
  store.customQuestions.set(base.slug, list);
  return qa;
}

export function placeOrderFromSession(
  session: SessionState,
  input: {
    customerName: string;
    phone: string;
    email?: string;
    areaId: DeliveryAreaId;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
  }
): { ok: true; order: Order } | { ok: false; errors: Record<string, string> } {
  if (session.cart.length === 0) {
    return { ok: false, errors: { cart: 'Your shopping cart is empty.' } };
  }

  const validation = validateCheckoutInput(input);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors as Record<string, string> };
  }

  const store = getStore();
  const area = DELIVERY_AREAS.find((a) => a.id === input.areaId) ?? DELIVERY_AREAS[0];
  const couponToUse = (input.couponCode ?? session.couponCode ?? '').trim();
  const totals = calculateCartTotals(session.cart, input.areaId, couponToUse);

  const orderNumber = `OTH-2026-${store.orderSeq++}`;
  const order: Order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    status: input.paymentMethod === 'cod' ? 'Confirmed' : 'Order Placed',
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    areaId: input.areaId,
    areaLabel: area.label,
    address: input.address.trim(),
    notes: input.notes?.trim() || undefined,
    paymentMethod: input.paymentMethod,
    couponCode: totals.appliedCoupon ?? undefined,
    subtotal: totals.subtotal,
    couponDiscount: totals.couponDiscount,
    shippingFee: totals.shippingFee,
    total: totals.total,
    items: session.cart.map((item) => ({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
    })),
    estimatedDelivery: area.eta,
  };

  store.orders.set(orderNumber, order);
  if (session.userId) {
    const existing = store.userOrders.get(session.userId) ?? [];
    store.userOrders.set(session.userId, [orderNumber, ...existing]);
  }

  // Clear cart after order placement
  session.cart = [];
  session.couponCode = '';

  return { ok: true, order };
}

export function sanitizeUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    defaultAreaId: user.defaultAreaId,
    defaultAddress: user.defaultAddress,
  };
}
