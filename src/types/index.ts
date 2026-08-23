export type LocalizedString = { en?: string; ar?: string } | string;

export interface LocationData {
  status?: string;
  country: string;
  countryCode: string;
  region?: string;
  regionName?: string;
  city: string;
  zip?: string;
  lat?: number;
  lon?: number;
}

export interface SliderItem {
  id: number;
  simple_slider_id: number;
  title: string | null;
  image: string;
  link: string;
  description: string | null;
  order: number;
}

export interface HomeCategoryItem {
  id: number;
  name: LocalizedString;
  image_url: string;
  slug: string;
  parent_slug: string;
  super_parent_slug: string;
  products_count: number;
}

export interface ApiCategory {
  id: number;
  parent_id: number | null;
  image_url: string;
  order: number;
  products_count?: number;
  name: LocalizedString;
  slug: string;
  children: ApiCategory[];
}

export interface ApiBrandSupplier {
  id?: number;
  product_id?: number;
  vendor_id: number;
  sale_price: string | number | null;
  price: number;
  inventory?: number | null;
  in_stock?: number;
  min_quantity: number;
  is_fixed: number | boolean;
  delivery_days: string;
  return_policy?: string;
  free_shipping?: number | boolean;
  shipping_charge?: string;
}

export interface ApiBrandProduct {
  id: number;
  sku: string;
  for_quotes: number;
  reviews_count: number;
  title: LocalizedString;
  image_urls: { en?: string[]; ar?: string[] };
  avg_rating: number | null;
  url: string;
  currency: { symbol?: string; title?: string };
  in_wishlist: boolean;
  in_cart: boolean;
  selling_type?: {
    en?: { attribute_value: string; attribute_value_unit: string };
    ar?: { attribute_value: string; attribute_value_unit: string };
  };
  is_accessory_required: boolean;
  product_accessories?: {
    id: number;
    is_required: number;
    name: LocalizedString;
    accessory_types: { id: number; price: number; name: LocalizedString }[];
  }[];
  best_supplier: ApiBrandSupplier | null;
}

export interface FeaturedCategory {
  id: number;
  name: LocalizedString;
  featured_products: ApiBrandProduct[];
}

export interface RawApiProduct {
  id: number;
  name?: LocalizedString;
  title?: LocalizedString;
  url: string;
  sku?: string;
  category_url?: string;
  parent_category_url?: string;
  price?: number;
  sale_price?: number;
  original_price?: number;
  best_price?: number;
  avg_rating: number | null;
  total_reviews?: number;
  reviews_count?: number;
  delivery_days?: string;
  currency?: { name?: string; symbol?: string; title?: string } | string;
  images?: string[] | { en?: string[]; ar?: string[] };
  image_urls?: string[] | { en?: string[]; ar?: string[] };
  in_wishlist?: boolean;
  in_cart?: boolean;
  min_quantity?: number;
  is_fixed?: number | boolean;
  quote_available?: number | boolean | null;
  for_quotes?: number | boolean;
  selling_type?: {
    attribute_value?: LocalizedString;
    attribute_value_unit?: LocalizedString;
  };
  suppliers?: {
    vendor_id?: number;
    delivery_days?: string;
    free_shipping?: boolean | number;
    min_quantity?: number;
    is_fixed?: boolean | number;
    sale_price?: number | string;
    price?: number | string;
    shipping_charge?: number | string;
  }[];
  best_supplier?: ApiBrandSupplier | null;
  isRequired?: boolean;
  is_accessory_required?: boolean;
  accessories?: Accessory[];
  product_accessories?: Accessory[];
}

export interface Accessory {
  id: number;
  name: LocalizedString;
  is_required: number;
  accessory_item?: { id: number; name: LocalizedString; price: number }[];
  accessory_types?: { id: number; name: LocalizedString; price: number }[];
}

export interface NormalizedProduct {
  id: number;
  name: string;
  url: string;
  slug: string;
  sku: string;
  image: string;
  images: string[];
  price: number;
  salePrice: number;
  originalPrice: number;
  hasSale: boolean;
  activePrice: number;
  currencySymbol: string;
  avgRating: number;
  totalReviews: number;
  deliveryDays: string;
  minQty: number;
  isFixed: boolean;
  isQuote: boolean;
  sellUnit: string;
  vendorId: number;
  inWishlist: boolean;
  inCart: boolean;
  accessories: Accessory[];
  hasRequiredAccessories: boolean;
  raw: RawApiProduct;
}

export interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  images: string[];
  description: string[];
  benefits_features: { benefit: string; feature: string }[];
  url: string;
  total_reviews: number;
  avg_rating: number | null;
  currency: { symbol: string; title: string };
  price: number;
  sale_price: number;
  selling_type?: { attribute_value: string; attribute_value_unit: string };
  suppliers: {
    vendor_id: number;
    price: number;
    sale_price: number;
    delivery_days: string;
    return_policy?: string;
    free_shipping?: boolean;
    min_quantity?: number;
    is_fixed?: boolean | number;
    vendor?: { name?: string };
  }[];
  attributes: { attribute_name: string; attribute_value: string }[];
  faqs: { id?: number; question: string; answer: string }[];
  variants?: {
    product_id: number;
    sku: string;
    attribute_name: string;
    attribute_value: string;
    label: string;
    selected: boolean;
    url: string;
    images?: string[];
  }[];
  reviews: {
    id: number;
    customer_name: string;
    star: number;
    comment: string;
    created_at: string;
  }[];
  accessories?: Accessory[];
  in_wishlist: boolean;
  for_quotes?: number | boolean;
  breadcrumbs?: { name: string; url: string }[];
}

export interface CartItem {
  productId: number;
  name: string;
  url: string;
  parentCategoryUrl: string;
  image: string;
  price: number;
  originalPrice: number;
  hasSale: boolean;
  currencySymbol: string;
  quantity: number;
  minQty: number;
  isFixed: boolean;
  isQuote: boolean;
  sellUnit: string;
  sku: string;
  vendorId: number;
  shippingCharge: number;
  subTotal: number;
  totalPrice: number;
  accessoryItemIds: number[];
  selectedAccessories?: { id: number; name: string; price: number }[];
  rawProduct?: RawApiProduct;
}

export interface ApiCartEntry {
  cartItemId: number;
  productId: number;
  quantity: number;
}
