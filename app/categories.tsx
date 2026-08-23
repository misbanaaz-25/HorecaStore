import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Loader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import type { ApiCategory } from "@/src/types";
import { resolveStr } from "@/src/utils/product";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CategoriesScreen() {
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeApiRequest<{ data: ApiCategory[] }>(apiUrls.NavigationAPI, {
      params: { with_parent: true },
    })
      .then((res) => setCats(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="All Categories" />
      {loading ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {cats.map((cat) => (
            <View key={cat.id} style={styles.block}>
              <Pressable
                style={styles.head}
                onPress={() =>
                  router.push(
                    (cat.slug === "shop-by-brands" ? "/brands" : `/category/${cat.slug}`) as any,
                  )
                }
              >
                {cat.image_url ? (
                  <Image source={{ uri: cat.image_url }} style={styles.icon} contentFit="contain" />
                ) : null}
                <Text style={styles.title}>{resolveStr(cat.name)}</Text>
              </Pressable>
              <View style={styles.kids}>
                {(cat.children ?? []).slice(0, 8).map((child) => (
                  <Pressable
                    key={child.id}
                    style={styles.kid}
                    onPress={() => router.push(`/category/${cat.slug}/${child.slug}` as any)}
                  >
                    <Text style={styles.kidText}>{resolveStr(child.name)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 18 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  icon: { width: 32, height: 32 },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  kids: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kid: {
    backgroundColor: colors.page,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  kidText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
});
