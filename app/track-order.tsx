import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Field, PrimaryButton } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function TrackOrderScreen() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    const num = Number(id.trim());
    if (!num) {
      setError("Enter a valid order number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await makeApiRequest(apiUrls.ORDER_DETAIL(num));
      router.push(`/order/${num}` as any);
    } catch {
      setError("Order not found. Check the number or login to view your orders.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Track order" />
      <View style={{ padding: 20 }}>
        <Text style={{ fontFamily: fonts.regular, color: colors.textMuted, marginBottom: 16, lineHeight: 20 }}>
          Enter your order number to view status and items.
        </Text>
        <Field label="Order number" value={id} onChangeText={setId} keyboardType="number-pad" />
        {error ? <Text style={{ color: colors.sale, marginBottom: 10 }}>{error}</Text> : null}
        <PrimaryButton label="Track" onPress={go} loading={loading} />
      </View>
    </View>
  );
}
