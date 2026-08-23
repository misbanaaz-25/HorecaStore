import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { AddToCartBar } from "@/src/components/AddToCartBar";
import { FeaturedSection } from "@/src/components/FeaturedSection";
import { RatingStars } from "@/src/components/RatingStars";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Chip, Loader } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  seedWishlistIds,
  toggleGuestWishlistItem,
  toggleWishlistItem,
} from "@/src/store/slices/wishlistSlice";
import { colors, fonts, radius } from "@/src/theme";
import type { FeaturedCategory, ProductDetail, RawApiProduct } from "@/src/types";
import {
  estimatedWeeklyLeasePayment,
  fmtPrice,
  isLeaseToOwnEligible,
  isQuoteMode,
} from "@/src/utils/product";
import { getToken, KEYS, setJson } from "@/src/utils/storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Heart, Share2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [similar, setSimilar] = useState<FeaturedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [img, setImg] = useState(0);
  const [tab, setTab] = useState<"overview" | "specs" | "reviews">("overview");
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [detail, similarRes] = await Promise.all([
          makeApiRequest<any>(apiUrls.PRODUCT_DETAIL(slug), { params: { lang: "en" } }),
          makeApiRequest<any>(apiUrls.SIMILAR_PRODUCTS(slug)).catch(() => null),
        ]);
        const product: ProductDetail = detail?.data ?? detail;
        if (!alive) return;
        setData(product);
        setImg(0);
        if (product.in_wishlist) dispatch(seedWishlistIds([product.id]));
        const similarProducts = similarRes?.data ?? similarRes?.products ?? [];
        if (Array.isArray(similarProducts) && similarProducts.length) {
          setSimilar([{ id: 1, name: "Similar", featured_products: similarProducts }]);
        }
        const token = await getToken();
        if (token) {
          makeApiRequest(apiUrls.ADD_RECENT_PRODUCT, {
            method: "POST",
            data: { product_id: String(product.id) },
          }).catch(() => {});
        } else {
          makeApiRequest<any>(apiUrls.GUEST_VIEW_PRODUCT, {
            method: "POST",
            data: { product_id: String(product.id) },
          })
            .then(async (res) => {
              if (res?.guest_token) await setJson(KEYS.guestToken, res.guest_token);
            })
            .catch(() => {});
        }
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, slug]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <StackHeader title="Product" />
        <Loader />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <StackHeader title="Product" />
        <Text style={{ padding: 24, fontFamily: fonts.medium, color: colors.textMuted }}>
          Product not found.
        </Text>
      </View>
    );
  }

  const supplier = data.suppliers?.[0];
  const sale = data.sale_price > 0 && data.sale_price !== data.price;
  const active = sale ? data.sale_price : data.price;
  const isQuote = isQuoteMode(data.for_quotes);
  const inWishlist = wishlistIds.includes(data.id);
  const raw: RawApiProduct = {
    id: data.id,
    name: data.name,
    url: data.url,
    sku: data.sku,
    price: data.price,
    sale_price: data.sale_price,
    avg_rating: data.avg_rating,
    total_reviews: data.total_reviews,
    images: data.images,
    currency: data.currency,
    in_wishlist: data.in_wishlist,
    for_quotes: data.for_quotes,
    selling_type: data.selling_type,
    suppliers: data.suppliers,
    accessories: data.accessories,
    min_quantity: supplier?.min_quantity,
    is_fixed: supplier?.is_fixed,
  };

  const toggleWish = async () => {
    const token = await getToken();
    if (token) {
      dispatch(toggleWishlistItem({ productId: data.id, currentlyInWishlist: inWishlist }));
    } else {
      dispatch(toggleGuestWishlistItem({ productId: data.id, rawProduct: raw }));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader
        title={data.name}
        right={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={toggleWish} hitSlop={8}>
              <Heart
                size={20}
                color={inWishlist ? colors.sale : colors.text}
                fill={inWishlist ? colors.sale : "transparent"}
              />
            </Pressable>
            <Pressable
              onPress={() => Share.share({ message: `${data.name}\nhttps://www.thehorecastore.com/${data.url}` })}
              hitSlop={8}
            >
              <Share2 size={20} color={colors.text} />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(data.images?.length ? data.images : ["https://placehold.co/600"]).map((uri, i) => (
            <Pressable key={`${uri}-${i}`} onPress={() => setImg(i)}>
              <Image source={{ uri }} style={styles.hero} contentFit="contain" />
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ padding: 16 }}>
          {data.sku ? <Text style={styles.sku}>Model No: {data.sku}</Text> : null}
          <Text style={styles.name}>{data.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <RatingStars rating={data.avg_rating ?? 0} size={16} />
            <Text style={styles.reviews}>{data.total_reviews} reviews</Text>
          </View>

          {isQuote ? (
            <View style={styles.quoteBox}>
              <Text style={styles.quoteTitle}>Price available on request</Text>
              <Text style={styles.quoteSub}>Tap Request A Quote to get your best price.</Text>
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <Text style={styles.symbol}>{data.currency?.symbol ?? "$"}</Text>
                <Text style={styles.price}>{fmtPrice(active)}</Text>
                {data.selling_type?.attribute_value_unit ? (
                  <Text style={styles.unit}>/{data.selling_type.attribute_value_unit}</Text>
                ) : null}
              </View>
              {sale ? (
                <Text style={styles.was}>
                  WAS {data.currency?.symbol ?? "$"}
                  {fmtPrice(data.price)}
                </Text>
              ) : null}
              {isLeaseToOwnEligible(active, isQuote) ? (
                <Text style={styles.lease}>
                  Lease to own · as low as ${estimatedWeeklyLeasePayment(active)}/week
                </Text>
              ) : null}
            </View>
          )}

          {supplier?.delivery_days ? (
            <Text style={styles.ship}>Mostly ships in {supplier.delivery_days}</Text>
          ) : null}

          {data.variants?.length ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.blockTitle}>Variants</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {data.variants.map((v) => (
                  <Chip
                    key={v.product_id + v.label}
                    label={v.label || v.attribute_value}
                    active={v.selected}
                    onPress={() => {
                      const next = v.url?.split("/").filter(Boolean).pop();
                      if (next) router.replace(`/product/${next}` as any);
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", marginTop: 18, gap: 8 }}>
            {(["overview", "specs", "reviews"] as const).map((t) => (
              <Chip key={t} label={t === "specs" ? "Specs" : t[0].toUpperCase() + t.slice(1)} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </View>

          {tab === "overview" ? (
            <View style={{ marginTop: 14 }}>
              {(data.description ?? []).map((p, i) => (
                <Text key={i} style={styles.para}>
                  {typeof p === "string" ? p.replace(/<[^>]+>/g, "") : ""}
                </Text>
              ))}
              {(data.benefits_features ?? []).map((b, i) => (
                <Text key={i} style={styles.para}>
                  • {b.benefit || b.feature}
                </Text>
              ))}
            </View>
          ) : null}

          {tab === "specs" ? (
            <View style={{ marginTop: 14 }}>
              {(data.attributes ?? []).map((a, i) => (
                <View key={i} style={styles.specRow}>
                  <Text style={styles.specK}>{a.attribute_name}</Text>
                  <Text style={styles.specV}>{a.attribute_value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "reviews" ? (
            <View style={{ marginTop: 14 }}>
              {(data.reviews ?? []).length === 0 ? (
                <Text style={styles.para}>No reviews yet.</Text>
              ) : (
                data.reviews.map((r) => (
                  <View key={r.id} style={styles.review}>
                    <Text style={styles.reviewName}>{r.customer_name}</Text>
                    <RatingStars rating={r.star} />
                    <Text style={styles.para}>{r.comment}</Text>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </View>

        {similar.length ? <FeaturedSection title="Similar products" groups={similar} /> : null}
      </ScrollView>

      <View style={styles.buyBar}>
        <AddToCartBar product={raw} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: 390, height: 300, backgroundColor: colors.muted },
  sku: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginTop: 4, lineHeight: 26 },
  reviews: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  symbol: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  price: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary },
  unit: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 4, marginLeft: 4 },
  was: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray, textDecorationLine: "line-through" },
  lease: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, marginTop: 4 },
  ship: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  quoteBox: {
    marginTop: 12,
    backgroundColor: "#fff5f5",
    borderRadius: radius.md,
    padding: 12,
  },
  quoteTitle: { fontFamily: fonts.bold, color: colors.quote },
  quoteSub: { fontFamily: fonts.regular, color: colors.textMuted, marginTop: 4 },
  blockTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  para: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginTop: 8 },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  specK: { fontFamily: fonts.medium, color: colors.textMuted, flex: 1 },
  specV: { fontFamily: fonts.semibold, color: colors.text, flex: 1, textAlign: "right" },
  review: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewName: { fontFamily: fonts.semibold, marginBottom: 4 },
  buyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
