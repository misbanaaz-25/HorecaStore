import { colors } from "@/src/theme";
import type { FeaturedCategory, RawApiProduct } from "@/src/types";
import { anyToRawProduct, mapBrandProductToCardProduct, resolveStr } from "@/src/utils/product";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ProductCard } from "./ProductCard";
import { Chip, SectionHeader } from "./ui";

export function FeaturedSection({
  title,
  groups,
}: {
  title: string;
  groups: FeaturedCategory[];
}) {
  const [active, setActive] = useState(0);
  const usable = groups.filter((g) => (g.featured_products?.length ?? 0) > 0);
  if (!usable.length) return null;
  const current = usable[Math.min(active, usable.length - 1)];
  const products: RawApiProduct[] = (current.featured_products ?? []).slice(0, 12).map((p) => {
    const raw = p as unknown as { title?: unknown; image_urls?: unknown };
    return raw.title && raw.image_urls
      ? mapBrandProductToCardProduct(p)
      : anyToRawProduct(p);
  });

  return (
    <View style={styles.wrap}>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title={title} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
      >
        {usable.map((g, i) => (
          <Chip
            key={g.id}
            label={resolveStr(g.name)}
            active={i === active}
            onPress={() => setActive(i)}
          />
        ))}
      </ScrollView>
      <View style={styles.line} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 22 },
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 14,
  },
});
