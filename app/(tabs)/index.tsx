import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { CategoryRow } from "@/src/components/CategoryRow";
import { CategorySheet } from "@/src/components/CategorySheet";
import { FeaturedSection } from "@/src/components/FeaturedSection";
import { HeroBanner } from "@/src/components/HeroBanner";
import { HomeHeader } from "@/src/components/ScreenHeader";
import { Loader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import type { ApiCategory, FeaturedCategory, HomeCategoryItem, SliderItem } from "@/src/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

const POPULAR = [
  { tag: "Commercial Oven", slug: "restaurant-equipment/commercial-oven" },
  { tag: "Commercial Fryer", slug: "restaurant-equipment/commercial-fryer" },
  { tag: "Prep Table", slug: "refrigeration/prep-table" },
  { tag: "Walk-In Freezer", slug: "refrigeration/walk-in-freezer" },
  { tag: "Ice Cream Freezer", slug: "refrigeration/ice-cream-freezer" },
  { tag: "Commercial Blender", slug: "restaurant-equipment/commercial-blender" },
  { tag: "Glassware", slug: "glassware" },
  { tag: "Pizza Trailer", slug: "food-trailers-and-trucks/pizza-trailer" },
];

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [categories, setCategories] = useState<HomeCategoryItem[]>([]);
  const [navCats, setNavCats] = useState<ApiCategory[]>([]);
  const [featured, setFeatured] = useState<FeaturedCategory[]>([]);
  const [brands, setBrands] = useState<FeaturedCategory[]>([]);

  const load = async () => {
    try {
      const [s1, featuredRes, cats, featuredBrands, nav] = await Promise.all([
        makeApiRequest<{ items: SliderItem[] }>(apiUrls.SLIDER(1)),
        makeApiRequest<{ data: FeaturedCategory[] }>(apiUrls.FEATURED_PRODUCTS, {
          params: { products_limit: 12, limit: 5, min_products: 12 },
        }),
        makeApiRequest<{ data: HomeCategoryItem[] }>("frontend-categories", {
          params: { category_type: "home" },
        }),
        makeApiRequest<{ data: FeaturedCategory[] }>(apiUrls.FEATURED_BRAND_PRODUCTS, {
          params: { products_limit: 12, limit: 5, min_products: 12 },
        }),
        makeApiRequest<{ data: ApiCategory[] }>(apiUrls.NavigationAPI),
      ]);
      setSlides(s1?.items ?? []);
      setFeatured(featuredRes?.data ?? []);
      setCategories(cats?.data ?? []);
      setBrands(featuredBrands?.data ?? []);
      setNavCats(nav?.data ?? []);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <HomeHeader onMenu={() => setMenuOpen(true)} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <HeroBanner slides={slides} />

        <View style={styles.seo}>
          <Text style={styles.h1}>
            Restaurant Supply Store for Commercial Kitchen Equipment & Supplies
          </Text>
          <Text style={styles.h2}>
            Shop Professional Restaurant Equipment, Foodservice Supplies, and Refrigeration
            Solutions
          </Text>
        </View>

        <CategoryRow categories={categories} />
        <FeaturedSection title="Featured Products" groups={featured} />

        <Pressable
          style={styles.banner}
          onPress={() => router.push("/category/food-trailers-and-trucks" as any)}
        >
          <Image
            source={{
              uri: "https://d1p9kdrbe10xzz.cloudfront.net/production/sliders/Landing+page+Banner.webp",
            }}
            style={styles.bannerImg}
            contentFit="cover"
          />
        </Pressable>

        <FeaturedSection title="Featured Brands" groups={brands} />

        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={styles.popularTitle}>Popular searches</Text>
          <View style={styles.chips}>
            {POPULAR.map((p) => {
              const parts = p.slug.split("/");
              return (
                <Pressable
                  key={p.slug}
                  style={styles.popChip}
                  onPress={() =>
                    router.push(
                      (parts.length > 1
                        ? `/category/${parts[0]}/${parts[1]}`
                        : `/category/${parts[0]}`) as any,
                    )
                  }
                >
                  <Text style={styles.popText}>{p.tag}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <CategorySheet visible={menuOpen} onClose={() => setMenuOpen(false)} categories={navCats} />
    </View>
  );
}

const styles = StyleSheet.create({
  seo: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.seoBg,
    borderRadius: 7,
    padding: 14,
  },
  h1: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, lineHeight: 21 },
  h2: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  banner: { marginHorizontal: 16, marginTop: 22, borderRadius: 7, overflow: "hidden" },
  bannerImg: { width: "100%", height: 110 },
  popularTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  popText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
});
