import { colors, fonts, radius } from "@/src/theme";
import type { HomeCategoryItem } from "@/src/types";
import { categoryHref, resolveStr } from "@/src/utils/product";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SectionHeader } from "./ui";

export function CategoryRow({ categories }: { categories: HomeCategoryItem[] }) {
  return (
    <View style={{ paddingTop: 20 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader
          title="Shop by Categories"
          action="All Categories"
          onAction={() => router.push("/categories")}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {chunk(categories, 2).map((col, i) => (
          <View key={i} style={{ gap: 12 }}>
            {col.map((cat) => {
              const name = resolveStr(cat.name);
              return (
                <Pressable
                  key={cat.id}
                  style={styles.item}
                  onPress={() =>
                    router.push(categoryHref(cat.super_parent_slug, cat.slug) as any)
                  }
                >
                  <View style={styles.icon}>
                    <Image
                      source={{ uri: cat.image_url }}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.name} numberOfLines={2}>
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const styles = StyleSheet.create({
  item: { width: 72, alignItems: "center" },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
});
