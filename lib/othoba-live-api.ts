import type { Product } from './types';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function decodeEntities(str = ''): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#x2B;/gi, '+')
    .replace(/&#43;/g, '+')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanImgUrl(raw: string): string {
  if (!raw) return '';
  const u = decodeEntities(raw).replace(/^['"]|['"]$/g, '').trim();
  if (u.startsWith('/')) return `https://othoba.com${u}`;
  return u;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'othoba-item';
}

interface RawLiveCard {
  pid: number;
  slug: string;
  name: string;
  hasCollectionPoint: boolean;
}

interface OthobaInfoPayload {
  PictureModels?: Array<{
    ProductId: number;
    ImageUrl?: string | null;
    ImageUrlForShow?: string | null;
  }>;
  PriceModels?: Array<{
    ProductId: number;
    PriceValue?: number;
    OldPriceValue?: number | null;
    DiscountPercentage?: number;
    DisableBuyButton?: boolean;
  }>;
  ProductReviewModel?: Array<{
    ProductId: number;
    TotalReviews?: number;
    RatingValue?: number;
  }>;
  TotalSoldQuantity?: Array<{
    ProductId: number;
    TotalQuantity?: number;
  }>;
  ProductEmiModel?: Array<{
    ProductId: number;
    EmiAvail?: boolean;
    Duration?: number;
  }>;
  ProductFreeShippingModel?: Array<{
    ProductId: number;
    ShouldShow?: boolean;
  }>;
  ProductVendorModel?: Array<{
    ProductId: number;
    VendorName?: string;
    VendorSeName?: string;
  }>;
  ProductManufacturerModel?: Array<
    Array<{
      ProductId?: number;
      Name?: string;
    }>
  >;
}

/**
 * Fetches live products from Othoba.com search endpoint + Catalog/LoadProductInfoByProductId
 * whenever a user searches for a term outside our pre-synced catalog.
 */
export async function searchLiveOthobaCatalog(query: string, limit = 24): Promise<Product[]> {
  const cleanQ = query.trim();
  if (cleanQ.length < 2) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const searchRes = await fetch(
      `https://othoba.com/search?q=${encodeURIComponent(cleanQ)}&pagesize=${limit}`,
      { headers: HEADERS, signal: controller.signal }
    );
    clearTimeout(timer);

    if (!searchRes.ok) return [];
    const cookies = searchRes.headers.getSetCookie ? searchRes.headers.getSetCookie() : [];
    const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
    const html = await searchRes.text();

    const cards: RawLiveCard[] = [];
    const seen = new Set<number>();
    const parts = html.split(/<div[^>]*class="[^"]*product-wrap[^"]*"[^>]*data-productid="(\d+)"[^>]*>/gi);
    for (let i = 1; i < parts.length; i += 2) {
      const pid = parseInt(parts[i], 10);
      const block = parts[i + 1] || '';
      const hrefMatch = block.match(/<h4[^>]*class="[^"]*product-name[^"]*"[^>]*>\s*<a[^>]*href="\/([^"?#]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const slug = hrefMatch ? hrefMatch[1].trim() : '';
      const name = hrefMatch ? decodeEntities(hrefMatch[2].replace(/<[^>]+>/g, '')) : '';
      if (pid && slug && name && !seen.has(pid)) {
        seen.add(pid);
        cards.push({
          pid,
          slug,
          name,
          hasCollectionPoint: block.includes('collectionpointIcon.svg'),
        });
      }
      if (cards.length >= limit) break;
    }

    if (cards.length === 0) return [];

    const infoCtrl = new AbortController();
    const infoTimer = setTimeout(() => infoCtrl.abort(), 7000);
    const infoRes = await fetch('https://othoba.com/Catalog/LoadProductInfoByProductId', {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(cards.map((c) => c.pid)),
      signal: infoCtrl.signal,
    });
    clearTimeout(infoTimer);

    if (!infoRes.ok) return [];
    const info = (await infoRes.json()) as OthobaInfoPayload;

    const picMap = new Map((info.PictureModels ?? []).map((x) => [x.ProductId, x]));
    const priceMap = new Map((info.PriceModels ?? []).map((x) => [x.ProductId, x]));
    const revMap = new Map((info.ProductReviewModel ?? []).map((x) => [x.ProductId, x]));
    const soldMap = new Map((info.TotalSoldQuantity ?? []).map((x) => [x.ProductId, x]));
    const emiMap = new Map((info.ProductEmiModel ?? []).map((x) => [x.ProductId, x]));
    const shipMap = new Map((info.ProductFreeShippingModel ?? []).map((x) => [x.ProductId, x]));
    const vendMap = new Map((info.ProductVendorModel ?? []).map((x) => [x.ProductId, x]));
    const mfgMap = new Map<number, string>();
    for (const arr of info.ProductManufacturerModel ?? []) {
      if (Array.isArray(arr) && arr[0]?.ProductId && arr[0].Name) {
        mfgMap.set(arr[0].ProductId, arr[0].Name);
      }
    }

    const mapped: Product[] = [];
    for (const c of cards) {
      const p = priceMap.get(c.pid);
      const pic = picMap.get(c.pid);
      const price = Math.round(p?.PriceValue ?? 0);
      const image = cleanImgUrl(pic?.ImageUrl ?? '');
      if (!price || price <= 0 || !image || image.includes('othoba-loader')) continue;

      const oldVal = Math.round(p?.OldPriceValue ?? 0);
      const originalPrice = oldVal > price ? oldVal : price;
      const discountPercent =
        p?.DiscountPercentage && p.DiscountPercentage > 0
          ? Math.round(p.DiscountPercentage)
          : originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const rev = revMap.get(c.pid);
      const sold = soldMap.get(c.pid);
      const emi = emiMap.get(c.pid);
      const ship = shipMap.get(c.pid);
      const vend = vendMap.get(c.pid);

      const brand =
        mfgMap.get(c.pid) ||
        c.name.split(/\s+/)[0].replace(/[^A-Za-z0-9&'-]/g, '') ||
        'Mrtom Choice';
      const sellerName = vend?.VendorName || `${brand} Official Store`;
      const sellerSlug = vend?.VendorSeName || slugify(sellerName);

      const gallery = [image];
      if (pic?.ImageUrlForShow) {
        const g2 = cleanImgUrl(pic.ImageUrlForShow);
        if (g2 && g2 !== image) gallery.push(g2);
      }

      mapped.push({
        id: `oth-${c.pid}`,
        othobaId: c.pid,
        sku: `MR-${c.pid}`,
        name: c.name,
        slug: c.slug,
        categorySlug: 'home-appliances',
        categoryName: 'Mrtom shop Catalog',
        subcategorySlug: 'search-results',
        subcategoryName: 'Live Results',
        brand,
        sellerSlug,
        sellerName,
        price,
        originalPrice,
        discountPercent,
        appPrice: Math.max(10, Math.round(price * 0.93)),
        rating: rev?.RatingValue ? Number(rev.RatingValue.toFixed(1)) : 4.7,
        reviewCount: rev?.TotalReviews ?? 0,
        soldCount: sold?.TotalQuantity ?? 25,
        inStock: !p?.DisableBuyButton,
        stockCount: 30,
        image,
        gallery,
        shortDescription: `${c.name} by ${brand}. Genuine Mrtom shop catalog item.`,
        description: `${c.name} from verified merchant ${sellerName}. Eligible for nationwide delivery across Bangladesh.`,
        specs: [
          { label: 'Brand', value: brand },
          { label: 'Product Code', value: `OTH-${c.pid}` },
        ],
        emiMonths: emi?.EmiAvail ? emi.Duration || 12 : price >= 5000 ? 12 : undefined,
        warranty: price >= 4000 ? '1 Year Official Brand Warranty' : '100% Authentic Guaranteed',
        freeDelivery: Boolean(ship?.ShouldShow) || price >= 3000,
        nextDayDelivery: c.pid % 3 === 0,
        collectionPoint: c.hasCollectionPoint,
        codAvailable: true,
        tags: [],
        reviews: [],
        questions: [],
      });
    }

    return mapped;
  } catch {
    return [];
  }
}
