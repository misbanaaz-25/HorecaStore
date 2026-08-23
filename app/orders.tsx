import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { EmptyState, Loader } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/hooks";
import { colors, fonts, radius } from "@/src/theme";
import { fmtPrice } from "@/src/utils/product";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function OrdersScreen() {
  const customer = useAppSelector((s) => s.profile.customer);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) {
      router.replace("/login");
      return;
    }
    makeApiRequest<any>(apiUrls.PLACE_ORDER, {
      params: { page: 1, length: 20, sort_dir: "desc" },
    })
      .then((res) => setOrders(res?.data ?? res?.orders ?? []))
      .finally(() => setLoading(false));
  }, [customer]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="My Orders" />
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, i) => String(item.id ?? i)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState title="No orders yet" action="Shop now" onAction={() => router.push("/(tabs)")} />}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/order/${item.id}` as any)}>
              <View style={styles.row}>
                <Text style={styles.id}>Order #{item.id}</Text>
                <Text style={styles.status}>{item.status ?? item.order_status ?? "Processing"}</Text>
              </View>
              <Text style={styles.meta}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
              </Text>
              <Text style={styles.total}>
                ${fmtPrice(Number(item.grand_total ?? item.total ?? item.amount ?? 0))}
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  id: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  status: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  total: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: 8 },
});
