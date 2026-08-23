import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { ProductCard } from "@/src/components/ProductCard";
import { StackHeader } from "@/src/components/ScreenHeader";
import { EmptyState, Loader } from "@/src/components/ui";
import { colors } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import { anyToRawProduct, slugToTitle } from "@/src/utils/product";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";

export default function BrandScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [products, setProducts] = useState<RawApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const cardW = (Dimensions.get("window").width - 42) / 2;

  useEffect(() => {
    if (!slug) return;
    makeApiRequest<any>(apiUrls.BRAND_BY_SLUG(slug))
      .then((res) => {
        const list = res?.data?.products ?? res?.products ?? res?.data ?? [];
        setProducts(Array.isArray(list) ? list.map((p: unknown) => anyToRawProduct(p)) : []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title={slugToTitle(slug ?? "Brand")} />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 40, gap: 10, paddingTop: 8 }}
          ListEmptyComponent={<EmptyState title="No products for this brand" />}
          renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
        />
      )}
    </View>
  );
}
