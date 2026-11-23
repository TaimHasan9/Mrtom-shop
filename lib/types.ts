export type DeliveryAreaId =
  | 'dhaka-north'
  | 'dhaka-south'
  | 'chattogram'
  | 'sylhet'
  | 'rajshahi'
  | 'khulna'
  | 'barishal'
  | 'rangpur'
  | 'mymensingh';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  othobaSlug?: string;
  aliases?: string[];
  menuIcon?: string;
  image: string;
  featuredOnHome: boolean;
  shortLabel?: string;
  subcategories: Subcategory[];
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  rating: number;
  shipOnTime: number;
  productCount: number;
  verified: boolean;
  tagline: string;
  location: string;
  logoText: string;
  logoImage?: string;
  sampleImages: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface ProductQuestion {
  id: string;
  author: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface ProductVariant {
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  othobaId?: number;
  sku: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string;
  subcategoryName: string;
  brand: string;
  sellerSlug: string;
  sellerName: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  appPrice: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
  variants?: ProductVariant[];
  emiMonths?: number;
  warranty?: string;
  freeDelivery?: boolean;
  nextDayDelivery?: boolean;
  collectionPoint?: boolean;
  codAvailable: boolean;
  tags: ('hot-deal' | 'trending' | 'featured' | 'new-arrival' | 'top-rated' | 'best-seller')[];
  reviews: ProductReview[];
  questions: ProductQuestion[];
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  selectedVariant?: string;
  availEmi?: boolean;
  freeDelivery?: boolean;
  sellerName: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Packed & Dispatched'
  | 'Out for Delivery'
  | 'Delivered';

export interface Order {
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email?: string;
  areaId: DeliveryAreaId;
  areaLabel: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  subtotal: number;
  couponDiscount: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  estimatedDelivery: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAreaId: DeliveryAreaId;
  defaultAddress: string;
}
