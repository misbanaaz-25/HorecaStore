import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { ProductCard } from "@/src/components/ProductCard";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Chip, EmptyState, Loader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import type { ApiCategory, RawApiProduct } from "@/src/types";
import { anyToRawProduct, categoryHref, resolveStr, slugToTitle } from "@/src/utils/product";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  const parts = Array.isArray(slug) ? slug : slug ? [slug] : [];
  const categoryUrl = parts[parts.length - 1] ?? "";
  const parent = parts[0] ?? "";
  const isListing = parts.length >= 2;
  const title = slugToTitle(categoryUrl);
  const cardW = (Dimensions.get("window").width - 42) / 2;

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<RawApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        if (!isListing) {
          const res = await makeApiRequest<{ data: ApiCategory[] }>(apiUrls.NavigationAPI, {
            params: { slug: categoryUrl, with_parent: false },
          });
          const tree = res?.data ?? [];
          const match =
            tree.find((c) => c.slug === categoryUrl) ??
            tree.flatMap((c) => c.children ?? []).find((c) => c.slug === categoryUrl);
          if (alive) setChildren(match?.children ?? tree);
        } else {
          const body: Record<string, unknown> = {
            category_url: categoryUrl,
            page: 1,
            length: 20,
            locale: "en",
            applied_filters: {},
            applied_range_filters: [{}],
            applied_fixed_filters: [{}],
          };
          if (sort !== "default") {
            body.sort_by = "price";
            body.sort_dir = sort;
          }
          const res = await makeApiRequest<any>(apiUrls.PRODUCTS_LISTING, {
            method: "POST",
            data: body,
          });
          const list = res?.products ?? res?.data ?? [];
          if (alive) {
            setProducts(list.map((p: unknown) => anyToRawProduct(p)));
            setTotal(res?.total ?? list.length);
            setPage(1);
          }
        }
      } catch {
        if (alive) {
          setChildren([]);
          setProducts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [categoryUrl, isListing, sort]);

  const loadMore = async () => {
    if (!isListing || products.length >= total) return;
    const next = page + 1;
    const body: Record<string, unknown> = {
      category_url: categoryUrl,
      page: next,
      length: 20,
      locale: "en",
      applied_filters: {},
      applied_range_filters: [{}],
      applied_fixed_filters: [{}],
    };
    if (sort !== "default") {
      body.sort_by = "price";
      body.sort_dir = sort;
    }
    const res = await makeApiRequest<any>(apiUrls.PRODUCTS_LISTING, { method: "POST", data: body });
    const list = res?.products ?? res?.data ?? [];
    setProducts((prev) => [...prev, ...list.map((p: unknown) => anyToRawProduct(p))]);
    setPage(next);
  };

  const header = useMemo(
    () => (
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        {isListing ? (
          <>
            <Text style={styles.count}>{total} products</Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Chip label="Default" active={sort === "default"} onPress={() => setSort("default")} />
              <Chip label="Price ↑" active={sort === "asc"} onPress={() => setSort("asc")} />
              <Chip label="Price ↓" active={sort === "desc"} onPress={() => setSort("desc")} />
            </View>
          </>
        ) : (
          <Text style={styles.sub}>Browse subcategories</Text>
        )}
      </View>
    ),
    [isListing, sort, total],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title={title} />
      {loading ? (
        <Loader />
      ) : !isListing ? (
        <FlatList
          data={children}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState title="No categories found" />}
          renderItem={({ item }) => (
            <Pressable
              style={styles.cat}
              onPress={() => router.push(categoryHref(parent || categoryUrl, item.slug) as any)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.catImg} contentFit="contain" />
              ) : null}
              <Text style={styles.catName}>{resolveStr(item.name)}</Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 40, gap: 10 }}
          ListHeaderComponent={header}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<EmptyState title="No products in this category" />}
          renderItem={({ item }) => <ProductCard product={item} width={cardW} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: fonts.medium, color: colors.textMuted, fontSize: 13 },
  sub: { fontFamily: fonts.regular, color: colors.textMuted },
  cat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  catImg: { width: 40, height: 40 },
  catName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, flex: 1 },
});
