import { ProductCard } from "@/src/components/ProductCard";
import { EmptyState, Loader } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchWishlist } from "@/src/store/slices/wishlistSlice";
import { colors, fonts } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import { anyToRawProduct } from "@/src/utils/product";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((s) => !!s.profile.customer);
  const guestItems = useAppSelector((s) => s.wishlist.guestItems);
  const apiEntries = useAppSelector((s) => s.wishlist.apiEntries);
  const status = useAppSelector((s) => s.wishlist.fetchStatus);
  const cardW = (Dimensions.get("window").width - 42) / 2;

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchWishlist());
  }, [dispatch, isLoggedIn]);

  const products = useMemo<RawApiProduct[]>(() => {
    if (!isLoggedIn) return guestItems.map((g) => anyToRawProduct(g.rawProduct));
    return apiEntries.map((e) => anyToRawProduct(e.product ?? e));
  }, [apiEntries, guestItems, isLoggedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top + 8 }}>
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: 22,
          color: colors.text,
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        Wishlist
      </Text>
      {isLoggedIn && status === "loading" && !products.length ? (
        <Loader />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 120, gap: 10 }}
          ListEmptyComponent={
            <EmptyState
              title="No saved items"
              subtitle="Tap the heart on a product to save it here."
              action="Browse products"
              onAction={() => router.push("/(tabs)")}
            />
          }
          renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
        />
      )}
    </View>
  );
}
