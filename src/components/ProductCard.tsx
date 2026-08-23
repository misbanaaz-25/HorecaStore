import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  seedWishlistIds,
  toggleGuestWishlistItem,
  toggleWishlistItem,
} from "@/src/store/slices/wishlistSlice";
import { colors, fonts, radius } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import {
  estimatedWeeklyLeasePayment,
  fmtPrice,
  isLeaseToOwnEligible,
  normalizeProduct,
  productHref,
} from "@/src/utils/product";
import { getToken } from "@/src/utils/storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AddToCartBar } from "./AddToCartBar";
import { RatingStars } from "./RatingStars";

export function ProductCard({
  product,
  width = 176,
}: {
  product: RawApiProduct;
  width?: number;
}) {
  const dispatch = useAppDispatch();
  const n = normalizeProduct(product);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);
  const hydrated = useAppSelector((s) => s.wishlist.hydrated);
  const toggling = useAppSelector((s) => s.wishlist.toggling.includes(n.id));
  const inWishlist = hydrated ? wishlistIds.includes(n.id) : !!product.in_wishlist;

  useEffect(() => {
    if (product.in_wishlist) dispatch(seedWishlistIds([n.id]));
  }, [dispatch, n.id, product.in_wishlist]);

  const toggleWish = async () => {
    if (toggling) return;
    const token = await getToken();
    if (token) {
      dispatch(toggleWishlistItem({ productId: n.id, currentlyInWishlist: inWishlist }));
    } else {
      dispatch(toggleGuestWishlistItem({ productId: n.id, rawProduct: product }));
    }
  };

  const showLease = isLeaseToOwnEligible(n.activePrice, n.isQuote);
  const weekly = showLease ? estimatedWeeklyLeasePayment(n.activePrice) : 0;
  const discountPct =
    n.hasSale && n.originalPrice > 0
      ? Math.round(((n.originalPrice - n.salePrice) / n.originalPrice) * 100)
      : 0;

  return (
    <Pressable
      onPress={() => router.push(productHref(n.url) as any)}
      style={[styles.card, { width }]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: n.image || "https://placehold.co/400" }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
        {discountPct > 0 ? (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>-{discountPct}%</Text>
          </View>
        ) : null}
        <Pressable onPress={toggleWish} style={styles.heart} hitSlop={8}>
          <Heart
            size={16}
            color={inWishlist ? colors.sale : colors.gray}
            fill={inWishlist ? colors.sale : "transparent"}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        {n.sku ? (
          <Text style={styles.sku} numberOfLines={1}>
            Model No: {n.sku}
          </Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {n.name}
        </Text>
        {n.avgRating > 0 ? (
          <View style={styles.ratingRow}>
            <RatingStars rating={n.avgRating} />
            {n.totalReviews > 0 ? (
              <Text style={styles.reviews}>({n.totalReviews})</Text>
            ) : null}
          </View>
        ) : null}

        {n.isQuote ? (
          <View style={styles.quoteBox}>
            <Text style={styles.quoteTitle}>Can't See the Price?</Text>
            <Text style={styles.quoteSub}>Request a quote for your best price.</Text>
          </View>
        ) : (
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.symbol}>{n.currencySymbol}</Text>
              <Text style={styles.price}>{fmtPrice(n.activePrice)}</Text>
              {n.sellUnit ? <Text style={styles.unit}>/{n.sellUnit}</Text> : null}
            </View>
            {n.hasSale ? (
              <Text style={styles.was}>
                WAS {n.currencySymbol}
                {fmtPrice(n.originalPrice)}
              </Text>
            ) : null}
            {showLease ? (
              <Text style={styles.lease}>As low as ${weekly}/week</Text>
            ) : null}
          </View>
        )}

        {n.deliveryDays ? (
          <Text style={styles.ship} numberOfLines={1}>
            Mostly Ships in {n.deliveryDays}
          </Text>
        ) : (
          <Text style={styles.ship}>Shipping charges apply</Text>
        )}

        <AddToCartBar product={product} compact />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  imageWrap: {
    height: 140,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  saleBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.saleBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleText: { color: colors.sale, fontFamily: fonts.bold, fontSize: 10 },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 10, gap: 5 },
  sku: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  name: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, lineHeight: 16 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviews: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  priceRow: { flexDirection: "row", alignItems: "flex-end" },
  symbol: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, marginRight: 1 },
  price: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  unit: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginLeft: 2, marginBottom: 2 },
  was: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.gray,
    textDecorationLine: "line-through",
  },
  lease: { fontFamily: fonts.semibold, fontSize: 10, color: colors.primary },
  quoteBox: {
    backgroundColor: "#fff5f5",
    borderRadius: 6,
    padding: 6,
  },
  quoteTitle: { fontFamily: fonts.bold, fontSize: 11, color: colors.quote },
  quoteSub: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  ship: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary },
});
