import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { useAppSelector } from "@/src/store/hooks";
import { colors, fonts, radius } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import { normalizeProduct } from "@/src/utils/product";
import { CheckCircle, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Field, PrimaryButton } from "./ui";
import { QuantityStepper } from "./QuantityStepper";

export function QuoteModal({
  visible,
  onClose,
  product,
}: {
  visible: boolean;
  onClose: () => void;
  product: RawApiProduct;
}) {
  const n = normalizeProduct(product);
  const country = useAppSelector((s) => s.country.data);
  const profile = useAppSelector((s) => s.profile.customer);
  const [qty, setQty] = useState(n.minQty);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.mobile_number ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !notes.trim()) {
      setError("Please fill name, email, phone, and notes.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await makeApiRequest(apiUrls.MADE_TO_ORDER, {
        method: "POST",
        data: {
          product_id: n.id,
          quantity: qty,
          name: name.trim(),
          email: email.trim(),
          phone_number: `${country?.phone_code ?? ""}${phone.trim()}`,
          country: country?.name ?? null,
          notes: notes.trim(),
        },
      });
      setDone(true);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>Request A Quote</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={colors.text} />
            </Pressable>
          </View>
          {done ? (
            <View style={styles.success}>
              <CheckCircle size={44} color={colors.primary} />
              <Text style={styles.successTitle}>Quote requested</Text>
              <Text style={styles.successSub}>
                Our team will contact you shortly with your best price for {n.name}.
              </Text>
              <PrimaryButton label="Close" onPress={onClose} style={{ marginTop: 16, width: "100%" }} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.product} numberOfLines={2}>
                {n.name}
              </Text>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.qtyLabel}>Quantity</Text>
                <QuantityStepper count={qty} min={n.minQty} onChange={setQty} isFixed={n.isFixed} />
              </View>
              <Field label="Name" value={name} onChangeText={setName} />
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Field
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={{ height: 90, textAlignVertical: "top" }}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton label="Submit quote request" onPress={submit} loading={loading} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "88%",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  product: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary, marginBottom: 12 },
  qtyLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  error: { color: colors.sale, marginBottom: 10, fontFamily: fonts.regular },
  success: { alignItems: "center", paddingVertical: 24 },
  successTitle: { fontFamily: fonts.bold, fontSize: 18, marginTop: 12, color: colors.text },
  successSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
