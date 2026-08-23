import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Loader } from "@/src/components/ui";
import { colors, fonts, radius } from "@/src/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function BrandsScreen() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeApiRequest<any>(apiUrls.BRANDS, { params: { with_logo: true } })
      .then((res) => setBrands(res?.data ?? res?.brands ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Brands" />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={brands}
          keyExtractor={(item, i) => String(item.id ?? item.slug ?? i)}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/brand/${item.slug}` as any)}
            >
              {item.logo || item.image || item.thumbnail ? (
                <Image
                  source={{ uri: item.logo ?? item.image ?? item.thumbnail }}
                  style={styles.logo}
                  contentFit="contain"
                />
              ) : null}
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
    minHeight: 120,
  },
  logo: { width: 80, height: 48, marginBottom: 8 },
  name: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, textAlign: "center" },
});
