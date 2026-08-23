import { colors, fonts, radius } from "@/src/theme";
import type { SliderItem } from "@/src/types";
import { categoryHref, productHref } from "@/src/utils/product";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Phone } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SUPPORT_PHONE, SUPPORT_PHONE_LABEL } from "@/src/theme";

const FALLBACK: SliderItem[] = [
  {
    id: 1,
    simple_slider_id: 1,
    title: "Commercial Kitchen Equipment",
    link: "/restaurant-equipment",
    image:
      "https://d1p9kdrbe10xzz.cloudfront.net/production/sliders/main-banner-1150-x-500-b2-2.webp",
    description: null,
    order: 1,
  },
  {
    id: 2,
    simple_slider_id: 1,
    title: "Premium Refrigeration",
    link: "/refrigeration",
    image:
      "https://d1p9kdrbe10xzz.cloudfront.net/production/sliders/Landing+page+Banner.webp",
    description: null,
    order: 2,
  },
];

function openLink(link?: string) {
  if (!link) return;
  const clean = link.replace(/^\//, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length >= 3) {
    router.push(productHref(link) as any);
  } else if (parts.length === 2) {
    router.push(categoryHref(parts[0], parts[1]) as any);
  } else if (parts.length === 1) {
    router.push(`/category/${parts[0]}` as any);
  }
}

export function HeroBanner({ slides }: { slides: SliderItem[] }) {
  const items = slides.length ? slides : FALLBACK;
  const width = Dimensions.get("window").width - 32;
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % items.length;
        ref.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [items.length, width]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => openLink(item.link)}>
            <Image
              source={{ uri: item.image }}
              style={[styles.slide, { width }]}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {items.map((item, i) => (
          <View key={item.id} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Opening a Restaurant?</Text>
        <Text style={styles.ctaBody}>
          From kitchen equipment to financing, we've got you covered.
        </Text>
        <Pressable
          style={styles.phoneRow}
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
        >
          <Phone size={15} color={colors.primary} />
          <Text style={styles.phone}>{SUPPORT_PHONE_LABEL}</Text>
        </Pressable>
        <Pressable style={styles.quoteBtn} onPress={() => router.push("/quote")}>
          <Text style={styles.quoteText}>Request a Free Quote</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: 168,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d1d5db" },
  dotOn: { backgroundColor: colors.primary, width: 16 },
  cta: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  ctaTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  ctaBody: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  phone: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary, textDecorationLine: "underline" },
  quoteBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 13 },
});
