import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Loader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import { fmtPrice, resolveStr } from "@/src/utils/product";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    makeApiRequest<any>(apiUrls.ORDER_DETAIL(Number(id)))
      .then((res) => setOrder(res?.data ?? res?.order ?? res))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title={`Order #${id}`} />
      {loading ? (
        <Loader />
      ) : !order ? (
        <Text style={{ padding: 20, fontFamily: fonts.medium }}>Order not found.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.status}>{order.status ?? order.order_status ?? "Processing"}</Text>
          <Text style={styles.meta}>
            Placed {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
          </Text>
          {(order.products ?? order.order_products ?? []).map((cp: any, i: number) => {
            const p = cp.product ?? cp;
            const name = typeof p.name === "string" ? p.name : resolveStr(p.name);
            const img = Array.isArray(p.images) ? p.images[0] : p.images?.en?.[0];
            return (
              <View key={i} style={styles.row}>
                <Image source={{ uri: img }} style={styles.img} contentFit="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.qty}>Qty {cp.quantity}</Text>
                </View>
                <Text style={styles.price}>
                  ${fmtPrice(Number(cp.unit_price ?? cp.price ?? 0))}
                </Text>
              </View>
            );
          })}
          <Text style={styles.total}>
            Total ${fmtPrice(Number(order.grand_total ?? order.total ?? 0))}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  row: { flexDirection: "row", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  img: { width: 56, height: 56, backgroundColor: colors.muted, borderRadius: 6 },
  name: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  qty: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  price: { fontFamily: fonts.semibold, color: colors.text },
  total: { fontFamily: fonts.bold, fontSize: 18, marginTop: 16, color: colors.text },
});
