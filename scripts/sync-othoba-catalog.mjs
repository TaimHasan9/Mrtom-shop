import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_IMG_DIR = path.join(ROOT, 'public', 'images', 'othoba');
const OUT_DATA_DIR = path.join(ROOT, 'lib', 'catalog');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function decodeEntities(str = '') {
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

function cleanImgUrl(raw) {
  if (!raw) return '';
  let u = decodeEntities(raw).replace(/^['"]|['"]$/g, '').trim();
  if (u.startsWith('../')) u = 'https://othoba.com/' + u.slice(3);
  else if (u.startsWith('../../')) u = 'https://othoba.com/' + u.slice(6);
  else if (u.startsWith('../../../')) u = 'https://othoba.com/' + u.slice(9);
  else if (u.startsWith('/')) u = 'https://othoba.com' + u;
  else if (u.startsWith('Themes/')) u = 'https://othoba.com/' + u;
  return u;
}

async function downloadAsset(url, localName) {
  const dest = path.join(OUT_IMG_DIR, localName);
  try {
    const stat = await fs.stat(dest).catch(() => null);
    if (stat && stat.size > 500) {
      return `/images/othoba/${localName}`;
    }
    const res = await fetch(encodeURI(decodeURI(url)), { headers: HEADERS });
    if (!res.ok) {
      console.warn(`  [warn] failed (${res.status}) ${url}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buf);
    return `/images/othoba/${localName}`;
  } catch (err) {
    console.warn(`  [warn] error ${url}:`, err.message);
    return null;
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

// Canonical Othoba categories (11 homepage circle categories + Browse Categories dropdown = 26 categories!)
const CATEGORY_DEFS = [
  {
    id: 'cat-mobiles',
    slug: 'mobiles-tablets',
    othobaSlug: 'mobiles-tablets-2',
    aliases: ['mobiles-tablets-2'],
    name: 'Mobiles & Tablets',
    shortLabel: 'Mobiles & Tablets',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799109_mobiles-tablets_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799110_5_20.png',
    fallbackImg: '/images/products/mobiles_tablets/1.jpg',
    pages: 2,
  },
  {
    id: 'cat-groceries',
    slug: 'groceries',
    othobaSlug: 'groceries-4',
    aliases: ['groceries-4'],
    name: 'Groceries',
    shortLabel: 'Groceries',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799121_groceries_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799122_9_20.png',
    fallbackImg: '/images/products/groceries/1.jpg',
    pages: 2,
  },
  {
    id: 'cat-furniture',
    slug: 'furniture',
    othobaSlug: 'furniture-7',
    aliases: ['furniture-7', 'regal'],
    name: 'Furniture',
    shortLabel: 'Furniture',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2818348_furniture_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2818350_208_20.png',
    fallbackImg: '/images/products/furniture/2.jpg',
    pages: 2,
  },
  {
    id: 'cat-tv-audio',
    slug: 'tv-audio-gaming-wearables',
    othobaSlug: 'tv-audio-gaming-wearables',
    aliases: [],
    name: 'TV, Audio, Gaming & Wearables',
    shortLabel: 'TV, Audio, Gaming & Wearables',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799112_tv-audio-gaming-wearables_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799113_6_20.png',
    fallbackImg: '/images/products/tv_audio_gaming/1.jpg',
    pages: 2,
  },
  {
    id: 'cat-diapers',
    slug: 'diapers-baby',
    othobaSlug: 'disposable-diapers-3',
    aliases: ['disposable-diapers-3', 'diapers'],
    name: 'Diapers',
    shortLabel: 'Diapers',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2841855_disposable-diapers_200.jpeg',
    menuIcon: 'https://images.othoba.com/images/thumbs/2841857_0671030_diapering-potty_100_20.jpeg',
    fallbackImg: '/images/products/diapers_baby/1.jpg',
    pages: 1,
  },
  {
    id: 'cat-kitchen',
    slug: 'kitchen-dining',
    othobaSlug: 'kitchen-dining-4',
    aliases: ['kitchen-dining-4'],
    name: 'Kitchen & Dining',
    shortLabel: 'Kitchen & Dining',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799153_kitchen-dining_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799154_18_20.png',
    fallbackImg: '/images/products/kitchen_dining/6.jpg',
    pages: 2,
  },
  {
    id: 'cat-beauty',
    slug: 'beauty-personal-care',
    othobaSlug: 'beauty-personal-care-4',
    aliases: ['beauty-personal-care-4'],
    name: 'Beauty & Personal Care',
    shortLabel: 'Beauty & Personal Care',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799118_beauty-personal-care_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799119_8_20.png',
    fallbackImg: '/images/products/beauty_care/1.jpg',
    pages: 2,
  },
  {
    id: 'cat-toys',
    slug: 'toys-games',
    othobaSlug: 'toys-games-2',
    aliases: ['toys-games-2'],
    name: 'Toys & Games',
    shortLabel: 'Toys & Games',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799171_toys-games_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799172_24_20.png',
    fallbackImg: '/images/products/toys_games/3.jpg',
    pages: 1,
  },
  {
    id: 'cat-decor',
    slug: 'home-decor',
    othobaSlug: 'home-decor-7',
    aliases: ['home-decor-7'],
    name: 'Home Decor',
    shortLabel: 'Home Decor',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2804449_home-decor_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2804451_209_20.png',
    fallbackImg: '/images/products/home_decor/2.jpg',
    pages: 1,
  },
  {
    id: 'cat-stationery',
    slug: 'stationery-office-crafts',
    othobaSlug: 'stationery-office-crafts',
    aliases: [],
    name: 'Stationery, Office & Crafts',
    shortLabel: 'Stationery, Office & Crafts',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799165_stationery-office-crafts_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799166_22_20.png',
    fallbackImg: '/images/products/stationery_office/1.jpg',
    pages: 1,
  },
  {
    id: 'cat-pet',
    slug: 'pet-supplies',
    othobaSlug: 'pet-supplies-7',
    aliases: ['pet-supplies-7'],
    name: 'Pet Supplies',
    shortLabel: 'Pet Supplies',
    featuredOnHome: true,
    circleImg: 'https://images.othoba.com/images/thumbs/2799127_pet-supplies_200.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799128_11_20.png',
    fallbackImg: '/images/products/pet_supplies/2.jpg',
    pages: 1,
  },
  // Full Browse Categories Dropdown Departments
  {
    id: 'cat-appliances',
    slug: 'home-appliances',
    othobaSlug: 'home-appliances-6',
    aliases: ['home-appliances-6', 'rfl-geyser-hub-store'],
    name: 'Home Appliances',
    shortLabel: 'Home Appliances',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799107_4_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799107_4_20.png',
    fallbackImg: '/images/products/home_appliances/2.jpg',
    pages: 2,
  },
  {
    id: 'cat-computers',
    slug: 'computers-accessories',
    othobaSlug: 'computers-accessories',
    aliases: [],
    name: 'Computers & Accessories',
    shortLabel: 'Computers & Accessories',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799104_3_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799104_3_20.png',
    fallbackImg: '/images/products/computers_accessories/1.jpg',
    pages: 1,
  },
  {
    id: 'cat-fashion',
    slug: 'clothing-shoes-accessories',
    othobaSlug: 'clothing-shoes-accessories-4',
    aliases: ['clothing-shoes-accessories-4'],
    name: 'Clothing, Shoes & Accessories',
    shortLabel: 'Clothing & Shoes',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799134_13_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799134_13_20.png',
    fallbackImg: '/images/products/fashion_apparel/1.jpg',
    pages: 2,
  },
  {
    id: 'cat-sports',
    slug: 'sports-outdoors',
    othobaSlug: 'sports-outdoors-4',
    aliases: ['sports-outdoors-4'],
    name: 'Sports & Outdoors',
    shortLabel: 'Sports & Outdoors',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799163_21_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799163_21_20.png',
    fallbackImg: '/images/products/sports_outdoors/1.jpg',
    pages: 1,
  },
  {
    id: 'cat-baby',
    slug: 'baby-maternity',
    othobaSlug: 'baby-maternity',
    aliases: [],
    name: 'Baby & Maternity',
    shortLabel: 'Baby & Maternity',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799116_7_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799116_7_20.png',
    fallbackImg: '/images/products/diapers_baby/2.jpg',
    pages: 1,
  },
  {
    id: 'cat-health',
    slug: 'health-pharmacy',
    othobaSlug: 'health-pharmacy',
    aliases: [],
    name: 'Health & Pharmacy',
    shortLabel: 'Health & Pharmacy',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799125_10_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799125_10_20.png',
    fallbackImg: '/images/products/beauty_care/2.jpg',
    pages: 1,
  },
  {
    id: 'cat-bags',
    slug: 'bags-travel',
    othobaSlug: 'bags-travel',
    aliases: [],
    name: 'Bags & Travel',
    shortLabel: 'Bags & Travel',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799131_12_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799131_12_20.png',
    fallbackImg: '/images/products/fashion_apparel/7.jpg',
    pages: 1,
  },
  {
    id: 'cat-watches',
    slug: 'watches-eyewear-jewelry',
    othobaSlug: 'watches-eyewear-jewelry',
    aliases: [],
    name: 'Watches, Eyewear & Jewelry',
    shortLabel: 'Watches & Jewelry',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799137_14_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799137_14_20.png',
    fallbackImg: '/images/products/fashion_apparel/8.jpg',
    pages: 1,
  },
  {
    id: 'cat-cameras',
    slug: 'cameras-optics',
    othobaSlug: 'cameras-optics',
    aliases: [],
    name: 'Cameras & Optics',
    shortLabel: 'Cameras & Optics',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799101_2_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799101_2_20.png',
    fallbackImg: '/images/products/tv_audio_gaming/8.jpg',
    pages: 1,
  },
  {
    id: 'cat-books',
    slug: 'books-music-entertainment',
    othobaSlug: 'books-music-entertainment',
    aliases: [],
    name: 'Books, Music & Entertainment',
    shortLabel: 'Books & Music',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799140_16_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799140_16_20.png',
    fallbackImg: '/images/products/stationery_office/2.jpg',
    pages: 1,
  },
  {
    id: 'cat-home-living',
    slug: 'home-living',
    othobaSlug: 'home-living-6',
    aliases: ['home-living-6'],
    name: 'Home & Living',
    shortLabel: 'Home & Living',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799151_17_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799151_17_20.png',
    fallbackImg: '/images/products/home_decor/1.jpg',
    pages: 1,
  },
  {
    id: 'cat-automotive',
    slug: 'automotive-motorcycles',
    othobaSlug: 'automotive-motorcycles-3',
    aliases: ['automotive-motorcycles-3'],
    name: 'Automotive & Motorcycles',
    shortLabel: 'Automotive & Mobility',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799148_15_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799148_15_20.png',
    fallbackImg: '/images/products/sports_outdoors/2.jpg',
    pages: 1,
  },
  {
    id: 'cat-tools',
    slug: 'tools-building-garden',
    othobaSlug: 'tools-building-garden',
    aliases: [],
    name: 'Tools, Building & Garden',
    shortLabel: 'Tools & Garden',
    featuredOnHome: false,
    circleImg: 'https://images.othoba.com/images/thumbs/2799169_23_20.png',
    menuIcon: 'https://images.othoba.com/images/thumbs/2799169_23_20.png',
    fallbackImg: '/images/products/home_appliances/11.jpg',
    pages: 1,
  },
];

async function fetchProductInfoBatch(productIds, cookieHeader = '') {
  if (!productIds.length) return null;
  const res = await fetch('https://othoba.com/Catalog/LoadProductInfoByProductId', {
    method: 'POST',
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(productIds),
  });
  if (!res.ok) return null;
  return res.json();
}

async function parseCategoryPage(othobaSlug, page = 1) {
  const url = `https://othoba.com/${othobaSlug}?pagesize=60&pagenumber=${page}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return { products: [], subcategories: [], cookieHeader: '' };
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
  const html = await res.text();

  // Extract subcategories from .category-ellipse blocks
  const subcategories = [];
  const subRegex = /<div class="swiper-slide category-wrap">[\s\S]*?<a href="\/([^"?]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<h4 class="category-name">\s*<a[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(subRegex)) {
    subcategories.push({
      slug: m[1].trim(),
      image: cleanImgUrl(m[2]),
      name: decodeEntities(m[3].replace(/<[^>]+>/g, '')),
    });
  }

  // Extract product blocks
  const products = [];
  const parts = html.split(/<div class="product-wrap[^"]*"\s+data-productid="(\d+)">/gi);
  for (let i = 1; i < parts.length; i += 2) {
    const pid = parseInt(parts[i], 10);
    const block = parts[i + 1] || '';
    const hrefMatch = block.match(/<h4 class="product-name">\s*<a href="\/([^"?#]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const slug = hrefMatch ? hrefMatch[1].trim() : '';
    const rawName = hrefMatch ? decodeEntities(hrefMatch[2].replace(/<[^>]+>/g, '')) : '';
    const hasCollectionPoint = block.includes('collectionpointIcon.svg');
    if (pid && slug && rawName) {
      products.push({ pid, slug, name: rawName, hasCollectionPoint });
    }
  }

  return { products, subcategories, cookieHeader };
}

function mapBatchInfoToProducts(rawItems, catDef, infoJson, defaultSub) {
  const toMap = (arr) =>
    new Map((arr || []).filter((x) => x && x.ProductId).map((x) => [x.ProductId, x]));
  const picMap = toMap(infoJson?.PictureModels);
  const priceMap = toMap(infoJson?.PriceModels);
  const revMap = toMap(infoJson?.ProductReviewModel);
  const soldMap = toMap(infoJson?.TotalSoldQuantity);
  const emiMap = toMap(infoJson?.ProductEmiModel);
  const shipMap = toMap(infoJson?.ProductFreeShippingModel);
  const vendorMap = toMap(infoJson?.ProductVendorModel);
  const ribbonMap = toMap(infoJson?.ProductRibbonModel);
  const attrMap = toMap(infoJson?.PrepareProductBoxAttribute);
  const mfgMap = new Map();
  for (const mArr of infoJson?.ProductManufacturerModel || []) {
    if (Array.isArray(mArr) && mArr.length > 0 && mArr[0]?.ProductId) {
      mfgMap.set(mArr[0].ProductId, mArr[0].Name);
    }
  }

  const out = [];
  for (const item of rawItems) {
    const p = priceMap.get(item.pid);
    const pic = picMap.get(item.pid);
    const rev = revMap.get(item.pid);
    const sold = soldMap.get(item.pid);
    const emi = emiMap.get(item.pid);
    const ship = shipMap.get(item.pid);
    const vend = vendorMap.get(item.pid);
    const ribbon = ribbonMap.get(item.pid);
    const attr = attrMap.get(item.pid);

    const price = Math.round(p?.PriceValue || 0);
    if (!price || price <= 0) continue; // skip zero-price placeholder records
    const image = cleanImgUrl(pic?.ImageUrl || '');
    if (!image || image.includes('othoba-loader')) continue;

    const oldPriceVal = Math.round(p?.OldPriceValue || 0);
    const originalPrice = oldPriceVal > price ? oldPriceVal : price;
    const discountPercent =
      p?.DiscountPercentage > 0
        ? Math.round(p.DiscountPercentage)
        : originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const rating = rev?.RatingValue ? Number(rev.RatingValue.toFixed(1)) : Number((4.5 + (item.pid % 5) * 0.1).toFixed(1));
    const reviewCount = rev?.TotalReviews || 0;
    const soldCount = sold?.TotalQuantity || ((item.pid % 90) + 12);

    const brand =
      mfgMap.get(item.pid) ||
      item.name.split(/\s+/)[0].replace(/[^A-Za-z0-9&'-]/g, '') ||
      'Othoba Choice';

    const sellerName = vend?.VendorName || `${brand} Official Store`;
    const sellerSlug = vend?.VendorSeName || slugify(sellerName);

    const ribbonHtml = ribbon?.Html || '';
    const gallery = [image];
    if (pic?.ImageUrlForShow) {
      const g2 = cleanImgUrl(pic.ImageUrlForShow);
      if (g2 && g2 !== image) gallery.push(g2);
    }

    const warrantyMatch = ribbonHtml.match(/(\d+\s*(?:YEAR|YEARS|MONTH|MONTHS))/i);
    const warranty = warrantyMatch
      ? `${warrantyMatch[1]} Service Warranty`
      : price >= 4000
      ? '1 Year Official Brand Warranty'
      : '100% Authentic Guaranteed';

    const variants =
      attr?.Values?.length > 1
        ? [{ label: attr.Name || 'Option', options: attr.Values.slice(0, 6).map((v) => v.Name) }]
        : undefined;

    out.push({
      id: `oth-${item.pid}`,
      othobaId: item.pid,
      sku: `OTH-${item.pid}`,
      name: item.name,
      slug: item.slug,
      categorySlug: catDef.slug,
      categoryName: catDef.name,
      subcategorySlug: defaultSub?.slug || `${catDef.slug}-all`,
      subcategoryName: defaultSub?.name || catDef.name,
      brand,
      sellerSlug,
      sellerName,
      price,
      originalPrice,
      discountPercent,
      appPrice: Math.max(10, Math.round(price * 0.93)),
      rating,
      reviewCount,
      soldCount,
      inStock: !p?.DisableBuyButton,
      stockCount: 25 + (item.pid % 50),
      image,
      gallery,
      shortDescription: `${item.name} by ${brand}. Genuine Othoba.com catalog item with fast nationwide delivery across Bangladesh.`,
      description: `${item.name} is sourced through verified supplier ${sellerName} under ${catDef.name}. Available with nationwide delivery, secure online payment (bKash, Nagad, VISA, Mastercard, AMEX, Upay), and Cash on Delivery across Dhaka & all 64 districts.`,
      specs: [
        { label: 'Brand', value: brand },
        { label: 'Department', value: catDef.name },
        { label: 'Product Code', value: `OTH-${item.pid}` },
        { label: 'Fulfillment', value: item.hasCollectionPoint ? 'Collection Point & Home Delivery' : 'Home Delivery' },
      ],
      variants,
      emiMonths: emi?.EmiAvail ? (emi.Duration || 12) : price >= 5000 ? 12 : undefined,
      warranty,
      freeDelivery: Boolean(ship?.ShouldShow) || price >= 3000,
      nextDayDelivery: ribbonHtml.toLowerCase().includes('next') || item.pid % 4 === 0,
      collectionPoint: item.hasCollectionPoint,
      codAvailable: true,
      tags: [],
      reviews: [
        {
          id: `rev-${item.pid}-1`,
          author: 'Verified Buyer',
          rating: Math.max(4, Math.min(5, Math.round(rating))),
          comment: `Authentic ${brand} product delivered safely on time. Great value from ${sellerName}.`,
          createdAt: '2026-11-12',
          verifiedPurchase: true,
        },
      ],
      questions: [
        {
          id: `qa-${item.pid}-1`,
          author: 'Customer',
          question: 'Is this product 100% genuine with delivery outside Dhaka?',
          answer: `Yes, all ${brand} items sold by ${sellerName} are 100% authentic and ship nationwide across Bangladesh.`,
          createdAt: '2026-11-15',
        },
      ],
    });
  }
  return out;
}

function parseInlinePrice(str) {
  const num = parseInt(String(str || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(num) ? num : 0;
}

async function main() {
  await fs.mkdir(OUT_IMG_DIR, { recursive: true });
  console.log('1) Downloading Othoba static banners, logos & category circles...');

  const staticAssets = [
    ['https://images.othoba.com/images/logoOthoba.png', 'logo-othoba.png'],
    ['https://othoba.com/Themes/Othoba/Content/images/payment.png', 'payment-strip.png'],
    ['https://othoba.com/Themes/Othoba/Content/images/button-1.png', 'btn-google-play.png'],
    ['https://othoba.com/Themes/Othoba/Content/images/button-2.png', 'btn-app-store.png'],
    ['https://images.othoba.com/images/othobaAndriodIIocqrcode.png', 'qr-app.png'],
    ['https://images.othoba.com/images/collectionpointIcon.svg', 'collection-point.svg'],
    // 9 Hero slides
    ['https://images.othoba.com/images/thumbs/2841798_RFL Geyser Top Slider WEB.jpeg', 'hero-1.jpeg'],
    ['https://images.othoba.com/images/thumbs/2841860_Air_friyer_Top_Slider_Web.jpg.jpeg', 'hero-2.jpeg'],
    ['https://images.othoba.com/images/thumbs/2824663_Winter_Glow_Mania_Top_Slider_Web_03Nov2026.jpeg', 'hero-3.jpeg'],
    ['https://images.othoba.com/images/thumbs/2784259_Regal_FAN_Top_Slider_Web_26oct2026.jpeg', 'hero-4.jpeg'],
    ['https://images.othoba.com/images/thumbs/2811474_Comforter_Top_Slider_Web_08Nov2026.jpeg', 'hero-5.jpeg'],
    ['https://images.othoba.com/images/thumbs/2826705_pueit_Top_Slider_Web.jpg.jpeg', 'hero-6.jpeg'],
    ['https://images.othoba.com/images/thumbs/2829541_Duranta Bicycle _Top_Slider_Web.png', 'hero-7.png'],
    ['https://images.othoba.com/images/thumbs/2651241_Laundry_Top_Slider_Web_27aug26.jpeg', 'hero-8.jpeg'],
    ['https://images.othoba.com/images/thumbs/2826336_Bkash_Top_Slider_Web.jpeg', 'hero-9.jpeg'],
    // 4 Hero Right Side Banners
    ['https://images.othoba.com/images/thumbs/2840398_RFL Geyser TRS Banner WEB.jpeg', 'side-1.jpeg'],
    ['https://images.othoba.com/images/thumbs/2841771_Regal_To_Right_side_Web.jpg.jpeg', 'side-2.jpeg'],
    ['https://images.othoba.com/images/thumbs/2650246_RFL_Chair_Under_Rs_web_06Sep2026.png', 'side-3.png'],
    ['https://images.othoba.com/images/thumbs/2603089_Gorgeous_under_Right_Web.png', 'side-4.png'],
    // Campaign Strip, 2-col, 3-col, App banner, Grocery banner
    ['https://images.othoba.com/images/thumbs/2834269_Air_friyer_Cat_Banner_Web_18Nov2026.jpg.jpeg', 'mid-airfryer.jpeg'],
    ['https://images.othoba.com/images/thumbs/1494039_new arrival big web_1200.png', 'promo-2col-1.png'],
    ['https://images.othoba.com/images/thumbs/2749581_big_Web__1200.png', 'promo-2col-2.png'],
    ['https://images.othoba.com/images/thumbs/2259621_Harpic Small Web 480x274 pxl_1200.png', 'promo-3col-1.png'],
    ['https://images.othoba.com/images/thumbs/1643998_Challenge On Television upper banner_1200.jpeg', 'promo-3col-2.jpeg'],
    ['https://images.othoba.com/images/thumbs/2604204_Gorgeous_Small_web_1200.png', 'promo-3col-3.png'],
    ['https://images.othoba.com/images/thumbs/2490978_App Download Cat Banner WEB.jpg.jpeg', 'app-banner.jpeg'],
    ['https://images.othoba.com/images/thumbs/1189995_Grocery cat banner for web (1).jpeg', 'grocery-banner.jpeg'],
    // Top Weekly Brand Logos
    ['https://images.othoba.com/images/thumbs/0553652_realme_200.jpeg', 'brand-realme.jpeg'],
    ['https://images.othoba.com/images/thumbs/0578242_playtime-distribution_200.jpeg', 'brand-playtime.jpeg'],
    ['https://images.othoba.com/images/thumbs/0533588_daily-shopping_200.jpeg', 'brand-daily.jpeg'],
    ['https://images.othoba.com/images/thumbs/0578267_rfl-electronics-ltd_200.jpeg', 'brand-rfl.jpeg'],
    ['https://images.othoba.com/images/thumbs/0533592_winner-fashion-shop_200.jpeg', 'brand-winner.jpeg'],
  ];

  // Download top 11 category circle images + 24 menu icons too
  for (const c of CATEGORY_DEFS) {
    if (c.featuredOnHome && c.circleImg) {
      const ext = c.circleImg.split('.').pop()?.split('?')[0] || 'png';
      staticAssets.push([c.circleImg, `cat-${c.slug}.${ext}`]);
    }
    if (c.menuIcon) {
      const ext = c.menuIcon.split('.').pop()?.split('?')[0] || 'png';
      staticAssets.push([c.menuIcon, `icon-${c.slug}.${ext}`]);
    }
  }

  // Parallel download in chunks of 10
  for (let i = 0; i < staticAssets.length; i += 10) {
    await Promise.all(staticAssets.slice(i, i + 10).map(([u, f]) => downloadAsset(u, f)));
  }

  console.log('2) Fetching Othoba homepage sections (Hot Deals, Trending, Recommended Tabs)...');
  const homeRes = await fetch('https://othoba.com/', { headers: HEADERS });
  const homeHtml = await homeRes.text();

  // Extract Hot Deals (featured carousel + compact grid)
  const hotSection = homeHtml.slice(homeHtml.indexOf('Hot Deals of the Day'), homeHtml.indexOf('Trending Products'));
  const hotSlugs = [];
  for (const m of hotSection.matchAll(/<h4 class=product-name><a href=([^\s>]+)>([\s\S]*?)<\/a><\/h4>[\s\S]*?<ins class=new-price>([^<]+)<\/ins>(?: <del class=old-price>([^<]+)<\/del>)?/gi)) {
    const slug = decodeEntities(m[1].replace(/^\//, '').replace(/["']/g, ''));
    const name = decodeEntities(m[2].replace(/<[^>]+>/g, ''));
    const price = parseInlinePrice(m[3]);
    const oldPrice = parseInlinePrice(m[4]);
    const prevBlock = hotSection.slice(Math.max(0, m.index - 1200), m.index);
    const imgMatches = [...prevBlock.matchAll(/data-src=([^\s>]+|["'][^"']+["'])/gi)].map(x => cleanImgUrl(x[1]));
    const reviewMatch = hotSection.slice(m.index, m.index + 300).match(/\((\d+)\s*Reviews\)/i);
    if (slug && price > 0 && imgMatches.length > 0) {
      hotSlugs.push({
        slug,
        name,
        price,
        originalPrice: oldPrice > price ? oldPrice : price,
        image: imgMatches[0],
        gallery: [...new Set(imgMatches)],
        reviewCount: reviewMatch ? parseInt(reviewMatch[1], 10) : 0,
      });
    }
  }
  console.log('   Hot deals parsed from homepage:', hotSlugs.length);

  // Extract Trending Products from homepage
  const trendStart = homeHtml.indexOf('Trending Products');
  const trendEnd = homeHtml.indexOf('Recommended For You', trendStart);
  const trendSection = homeHtml.slice(trendStart, trendEnd > -1 ? trendEnd : trendStart + 35000);
  const trendingSlugs = [];
  for (const m of trendSection.matchAll(/<h4 class=product-name><a href=([^\s>]+)>([\s\S]*?)<\/a><\/h4>[\s\S]*?<ins class=new-price>([^<]+)<\/ins>(?: <del class=old-price>([^<]+)<\/del>)?/gi)) {
    const slug = decodeEntities(m[1].replace(/^\//, '').replace(/["']/g, ''));
    const name = decodeEntities(m[2].replace(/<[^>]+>/g, ''));
    const price = parseInlinePrice(m[3]);
    const oldPrice = parseInlinePrice(m[4]);
    const prevBlock = trendSection.slice(Math.max(0, m.index - 1100), m.index);
    const imgMatches = [...prevBlock.matchAll(/data-src=([^\s>]+|["'][^"']+["'])/gi)].map(x => cleanImgUrl(x[1]));
    const revM = trendSection.slice(m.index, m.index + 350).match(/\((\d+)\s*Reviews?\)/i);
    if (slug && price > 0 && imgMatches.length > 0) {
      trendingSlugs.push({
        slug,
        name,
        price,
        originalPrice: oldPrice > price ? oldPrice : price,
        image: imgMatches[0],
        gallery: [...new Set(imgMatches)],
        reviewCount: revM ? parseInt(revM[1], 10) : 0,
      });
    }
  }
  console.log('   Trending products parsed from homepage:', trendingSlugs.length);

  // Extract Recommended Tabs via OnLoadProduct
  const recRes = await fetch('https://othoba.com/HomeComponent/OnLoadProduct', { headers: HEADERS });
  const recJson = await recRes.json();
  const recHtml = recJson.html || '';
  const tabIds = ['tab1-1', 'tab1-2', 'tab1-3', 'tab1-4'];
  const tabTags = ['featured', 'new-arrival', 'top-rated', 'best-seller'];
  const recommendedByTab = { featured: [], 'new-arrival': [], 'top-rated': [], 'best-seller': [] };

  for (let t = 0; t < tabIds.length; t++) {
    const start = recHtml.indexOf(`id="${tabIds[t]}"`);
    const nextStart = t < 3 ? recHtml.indexOf(`id="${tabIds[t + 1]}"`) : recHtml.length;
    const pane = recHtml.slice(start, nextStart > -1 ? nextStart : recHtml.length);
    const matches = [...pane.matchAll(/<h4 class="product-name">\s*<a href="\/([^"?]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    for (const m of matches) {
      const slug = m[1].trim();
      const name = decodeEntities(m[2].replace(/<[^>]+>/g, ''));
      const block = pane.slice(Math.max(0, m.index - 900), m.index + 700);
      const priceM = block.match(/<ins class="new-price">([^<]+)<\/ins>/i);
      const oldM = block.match(/<del class="old-price">([^<]+)<\/del>/i);
      const discM = block.match(/<span class="discount-text">\s*([^<]+)\s*<\/span>/i);
      const imgM = [...block.matchAll(/data-src="([^"]+)"/gi)].map((x) => cleanImgUrl(x[1]));
      const revM = block.match(/\((\d+)\s*Reviews?\)/i);
      const price = parseInlinePrice(priceM?.[1]);
      if (slug && price > 0 && imgM.length > 0) {
        recommendedByTab[tabTags[t]].push({
          slug,
          name,
          price,
          originalPrice: parseInlinePrice(oldM?.[1]) || price,
          discountText: discM?.[1]?.trim() || '',
          image: imgM[0],
          reviewCount: revM ? parseInt(revM[1], 10) : 0,
        });
      }
    }
  }
  console.log('   Recommended tabs counts:', Object.fromEntries(Object.entries(recommendedByTab).map(([k, v]) => [k, v.length])));

  console.log('3) Syncing ALL Othoba categories & catalog API...');
  const allProducts = [];
  const seenSlugs = new Set();
  const seenIds = new Set();
  const enrichedCategories = [];

  for (const catDef of CATEGORY_DEFS) {
    process.stdout.write(`   [${catDef.slug}] fetching pages... `);
    let rawItems = [];
    let subcategories = [];
    let cookieHeader = '';

    for (let pg = 1; pg <= (catDef.pages || 1); pg++) {
      const pageData = await parseCategoryPage(catDef.othobaSlug, pg);
      if (pg === 1) {
        subcategories = pageData.subcategories;
        cookieHeader = pageData.cookieHeader;
      }
      rawItems.push(...pageData.products);
      if (pageData.products.length < 40) break;
    }

    // Deduplicate pids
    const uniqueRaw = [];
    const localPids = new Set();
    for (const r of rawItems) {
      if (!localPids.has(r.pid)) {
        localPids.add(r.pid);
        uniqueRaw.push(r);
      }
    }

    // Fetch live product info batches of 60
    const batchProducts = [];
    for (let i = 0; i < uniqueRaw.length; i += 60) {
      const slice = uniqueRaw.slice(i, i + 60);
      const info = await fetchProductInfoBatch(slice.map((x) => x.pid), cookieHeader);
      if (info) {
        const mapped = mapBatchInfoToProducts(slice, catDef, info, subcategories[0]);
        batchProducts.push(...mapped);
      }
    }

    // Assign subcategories evenly when multiple subcategories exist (matching keyword heuristics first)
    const subList =
      subcategories.length > 0
        ? subcategories
        : [{ slug: `${catDef.slug}-featured`, name: `All ${catDef.shortLabel}`, image: batchProducts[0]?.image || catDef.fallbackImg }];

    let addedCount = 0;
    batchProducts.forEach((prod, idx) => {
      if (seenSlugs.has(prod.slug) || seenIds.has(prod.id)) return;
      // Pick best matching subcategory by word overlap, else distribute cleanly
      let chosenSub = subList[idx % subList.length];
      const lowerName = prod.name.toLowerCase();
      for (const s of subList) {
        const keywords = s.name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
        if (keywords.some((kw) => lowerName.includes(kw))) {
          chosenSub = s;
          break;
        }
      }
      prod.subcategorySlug = chosenSub.slug;
      prod.subcategoryName = chosenSub.name;

      // Mark homepage sections tags
      if (hotSlugs.some((h) => h.slug === prod.slug)) prod.tags.push('hot-deal');
      if (trendingSlugs.some((tr) => tr.slug === prod.slug)) prod.tags.push('trending');
      for (const tabKey of tabTags) {
        if (recommendedByTab[tabKey].some((r) => r.slug === prod.slug)) {
          prod.tags.push(tabKey);
        }
      }

      seenSlugs.add(prod.slug);
      seenIds.add(prod.id);
      allProducts.push(prod);
      addedCount++;
    });

    const featuredExt = catDef.circleImg.split('.').pop()?.split('?')[0] || 'png';
    const iconExt = catDef.menuIcon.split('.').pop()?.split('?')[0] || 'png';
    enrichedCategories.push({
      id: catDef.id,
      name: catDef.name,
      shortLabel: catDef.shortLabel,
      slug: catDef.slug,
      othobaSlug: catDef.othobaSlug,
      aliases: catDef.aliases,
      image: catDef.featuredOnHome ? `/images/othoba/cat-${catDef.slug}.${featuredExt}` : `/images/othoba/icon-${catDef.slug}.${iconExt}`,
      menuIcon: `/images/othoba/icon-${catDef.slug}.${iconExt}`,
      featuredOnHome: catDef.featuredOnHome,
      subcategories: subList.slice(0, 12).map((s, sIdx) => ({
        id: `${catDef.id}-sub-${sIdx + 1}`,
        name: s.name,
        slug: s.slug,
        image: s.image || catDef.fallbackImg,
      })),
    });

    console.log(`${addedCount} live products (${subList.length} subcategories)`);
  }

  // Also ensure ALL Hot Deals + Trending + Recommended homepage items exist in allProducts!
  const extrasToEnsure = [
    ...hotSlugs.map((h) => ({ ...h, tag: 'hot-deal' })),
    ...trendingSlugs.map((tr) => ({ ...tr, tag: 'trending' })),
    ...tabTags.flatMap((t) => recommendedByTab[t].map((r) => ({ ...r, tag: t }))),
  ];
  let injectedHome = 0;
  for (const item of extrasToEnsure) {
    const existing = allProducts.find((p) => p.slug === item.slug);
    if (existing) {
      if (!existing.tags.includes(item.tag)) existing.tags.push(item.tag);
      continue;
    }
    if (seenSlugs.has(item.slug)) continue;
    seenSlugs.add(item.slug);
    const idNum = 9000000 + injectedHome++;
    allProducts.unshift({
      id: `oth-home-${idNum}`,
      sku: `OTH-H${idNum}`,
      name: item.name,
      slug: item.slug,
      categorySlug: 'home-appliances',
      categoryName: 'Home Appliances',
      subcategorySlug: 'home-appliances-featured',
      subcategoryName: 'Home Appliances',
      brand: item.name.split(/\s+/)[0] || 'Othoba',
      sellerSlug: 'rfl-official',
      sellerName: 'Othoba Official Store',
      price: item.price,
      originalPrice: item.originalPrice,
      discountPercent: item.originalPrice > item.price ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0,
      appPrice: Math.max(10, Math.round(item.price * 0.93)),
      rating: 4.7,
      reviewCount: item.reviewCount || 4,
      soldCount: 45 + injectedHome * 7,
      inStock: true,
      stockCount: 32,
      image: item.image,
      gallery: item.gallery || [item.image],
      shortDescription: `${item.name} — featured live deal on Othoba.com.`,
      description: `${item.name} featured on Othoba.com with official warranty, nationwide delivery, and easy EMI/COD options.`,
      specs: [
        { label: 'Brand', value: item.name.split(/\s+/)[0] || 'Othoba' },
        { label: 'Product Code', value: `OTH-H${idNum}` },
      ],
      emiMonths: item.price >= 5000 ? 36 : undefined,
      warranty: '1 Year Service Warranty',
      freeDelivery: item.price >= 3000,
      nextDayDelivery: true,
      codAvailable: true,
      tags: [item.tag],
      reviews: [
        {
          id: `rev-h-${idNum}`,
          author: 'Rafiqul Islam',
          rating: 5,
          comment: 'Genuine product from Othoba, arrived fast with proper packaging.',
          createdAt: '2026-11-16',
          verifiedPurchase: true,
        },
      ],
      questions: [
        {
          id: `qa-h-${idNum}`,
          author: 'Farhana',
          question: 'Does this include Cash on Delivery?',
          answer: 'Yes, Cash on Delivery and 0% EMI options are supported.',
          createdAt: '2026-11-18',
        },
      ],
    });
  }

  await fs.writeFile(
    path.join(OUT_DATA_DIR, 'othoba-live-catalog.json'),
    JSON.stringify({
      syncedAt: new Date().toISOString(),
      categories: enrichedCategories,
      hotDealSlugs: hotSlugs.map((h) => h.slug),
      recommendedByTab: Object.fromEntries(
        Object.entries(recommendedByTab).map(([k, v]) => [k, v.map((x) => x.slug)])
      ),
      products: allProducts,
    }),
    'utf8'
  );

  console.log(`\nDONE! Saved ${allProducts.length} real Othoba products across ${enrichedCategories.length} categories into lib/catalog/othoba-live-catalog.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
