import type {
  ApiBrandProduct,
  LocalizedString,
  NormalizedProduct,
  RawApiProduct,
} from "@/src/types";

export function resolveStr(v: LocalizedString | undefined, locale = "en"): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return locale === "ar" ? (v.ar ?? v.en ?? "") : (v.en ?? v.ar ?? "");
}

export function resolveCurrencySymbol(
  c: string | { name?: string; symbol?: string; title?: string } | undefined,
): string {
  if (!c) return "$";
  if (typeof c === "string") return c;
  return c.symbol ?? c.name ?? "$";
}

export function isQuoteMode(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") {
    return v !== "0" && v.toLowerCase() !== "false" && v !== "";
  }
  return !!v;
}

export function toNum(v: number | string | undefined | null): number {
  if (v == null) return 0;
  return typeof v === "string" ? parseFloat(v) || 0 : v;
}

export function fmtPrice(n: number): string {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function estimatedWeeklyLeasePayment(price: number): number {
  return Math.round(price / 1000) * 13;
}

export function isLeaseToOwnEligible(price: number, quoteAvailable?: boolean | null) {
  if (quoteAvailable) return false;
  return Number.isFinite(price) && price >= 1000;
}

export function resolveImages(
  images: string[] | { en?: string[]; ar?: string[] } | undefined,
): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  return (images.en ?? images.ar ?? []).filter(Boolean);
}

export function productSlug(url?: string): string {
  if (!url) return "";
  const clean = url.split("?")[0].replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function productHref(url?: string): string {
  const slug = productSlug(url);
  return slug ? `/product/${slug}` : "/";
}

export function categoryHref(superParent?: string, slug?: string): string {
  if (superParent && slug && superParent !== slug) {
    return `/category/${superParent}/${slug}`;
  }
  if (slug) return `/category/${slug}`;
  return "/categories";
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function mapBrandProductToCardProduct(product: ApiBrandProduct): RawApiProduct {
  const supplier = product.best_supplier;
  const sellingType = product.selling_type?.en ?? product.selling_type?.ar;
  return {
    id: product.id,
    name: product.title,
    url: product.url,
    sku: product.sku,
    price: Number(supplier?.price ?? 0),
    sale_price: Number(supplier?.sale_price ?? 0),
    avg_rating: product.avg_rating,
    total_reviews: product.reviews_count,
    delivery_days: supplier?.delivery_days,
    currency: product.currency,
    images: product.image_urls,
    in_wishlist: product.in_wishlist,
    in_cart: product.in_cart,
    min_quantity: supplier?.min_quantity,
    is_fixed: supplier?.is_fixed,
    quote_available: product.for_quotes,
    for_quotes: product.for_quotes,
    selling_type: sellingType
      ? {
          attribute_value: sellingType.attribute_value,
          attribute_value_unit: sellingType.attribute_value_unit,
        }
      : undefined,
    suppliers: supplier
      ? [
          {
            vendor_id: supplier.vendor_id,
            delivery_days: supplier.delivery_days,
            free_shipping: supplier.free_shipping,
            min_quantity: supplier.min_quantity,
            is_fixed: supplier.is_fixed,
            price: supplier.price,
            sale_price: supplier.sale_price ?? 0,
          },
        ]
      : undefined,
    isRequired: product.is_accessory_required,
    accessories: (product.product_accessories ?? []).map((acc) => ({
      id: acc.id,
      name: acc.name,
      is_required: acc.is_required,
      accessory_item: acc.accessory_types.map((type) => ({
        id: type.id,
        name: type.name,
        price: type.price,
      })),
    })),
  };
}

export function normalizeProduct(product: RawApiProduct): NormalizedProduct {
  const supplier0 = product.suppliers?.[0] ?? product.best_supplier;
  const images = resolveImages(product.images ?? product.image_urls);
  const originalPrice =
    product.original_price ??
    product.price ??
    product.best_price ??
    toNum(supplier0?.price);
  const salePrice = product.sale_price ?? toNum(supplier0?.sale_price);
  const hasSale = salePrice > 0 && salePrice !== originalPrice;
  const isQuote = isQuoteMode(product.for_quotes ?? product.quote_available);
  const accessories = product.accessories ?? product.product_accessories ?? [];

  return {
    id: product.id,
    name: resolveStr(product.name ?? product.title),
    url: product.url ?? "",
    slug: productSlug(product.url),
    sku: product.sku ?? "",
    image: images[0] ?? "",
    images,
    price: originalPrice,
    salePrice,
    originalPrice,
    hasSale,
    activePrice: hasSale ? salePrice : originalPrice,
    currencySymbol: resolveCurrencySymbol(product.currency),
    avgRating: product.avg_rating ?? 0,
    totalReviews: product.total_reviews ?? product.reviews_count ?? 0,
    deliveryDays: product.delivery_days ?? supplier0?.delivery_days ?? "",
    minQty: product.min_quantity ?? supplier0?.min_quantity ?? 1,
    isFixed: !!(product.is_fixed ?? supplier0?.is_fixed),
    isQuote,
    sellUnit: resolveStr(product.selling_type?.attribute_value_unit),
    vendorId: supplier0?.vendor_id ?? 0,
    inWishlist: !!product.in_wishlist,
    inCart: !!product.in_cart,
    accessories,
    hasRequiredAccessories:
      accessories.some((a) => a.is_required === 1) ||
      !!product.is_accessory_required ||
      !!product.isRequired,
    raw: product,
  };
}

export function anyToRawProduct(input: unknown): RawApiProduct {
  const p = input as Record<string, unknown>;
  return {
    id: Number(p.id ?? p.product_id),
    name: (p.name ?? p.title) as LocalizedString,
    title: p.title as LocalizedString | undefined,
    url: String(p.url ?? ""),
    sku: String(p.sku ?? ""),
    price: toNum(p.price as number),
    sale_price: toNum((p.sale_price as number) ?? 0),
    original_price: toNum((p.original_price as number) ?? (p.price as number)),
    avg_rating: (p.avg_rating as number | null) ?? null,
    total_reviews: Number(p.total_reviews ?? p.reviews_count ?? 0),
    images: (p.images ?? p.image_urls ?? p.image) as RawApiProduct["images"],
    currency: p.currency as RawApiProduct["currency"],
    in_wishlist: Boolean(p.in_wishlist),
    in_cart: Boolean(p.in_cart),
    for_quotes: (p.for_quotes ?? p.quote_available) as number | boolean,
    quote_available: p.quote_available as number | boolean | null,
    suppliers: p.suppliers as RawApiProduct["suppliers"],
    best_supplier: p.best_supplier as RawApiProduct["best_supplier"],
    min_quantity: Number(p.min_quantity ?? 1),
    is_fixed: p.is_fixed as number | boolean,
    delivery_days: String(p.delivery_days ?? ""),
    selling_type: p.selling_type as RawApiProduct["selling_type"],
    accessories: p.accessories as RawApiProduct["accessories"],
    product_accessories: p.product_accessories as RawApiProduct["product_accessories"],
    category_url: String(p.category_url ?? p.category_url_resolved ?? ""),
    parent_category_url: String(
      p.parent_category_url ?? p.parent_category_url_resolved ?? "",
    ),
  };
}
