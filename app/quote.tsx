import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { Field, PrimaryButton } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/hooks";
import { colors, fonts } from "@/src/theme";
import { SUPPORT_PHONE, SUPPORT_PHONE_LABEL } from "@/src/theme";
import { Phone } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuoteScreen() {
  const profile = useAppSelector((s) => s.profile.customer);
  const country = useAppSelector((s) => s.country.data);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.mobile_number ?? "");
  const [notes, setNotes] = useState("Opening a restaurant — please contact me about equipment and financing.");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await makeApiRequest(apiUrls.MADE_TO_ORDER, {
        method: "POST",
        data: {
          product_id: 0,
          quantity: 1,
          name: name.trim(),
          email: email.trim(),
          phone_number: `${country?.phone_code ?? "+1"}${phone.trim()}`,
          country: country?.name ?? "United States",
          notes: notes.trim(),
        },
      });
      setDone(true);
    } catch {
      setError("Could not send your request. Call us instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Free quote" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.h}>Opening a Restaurant?</Text>
        <Text style={styles.p}>
          From kitchen equipment to financing, we've got you covered. Tell us what you need.
        </Text>
        <Pressable style={styles.call} onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}>
          <Phone size={16} color={colors.primary} />
          <Text style={styles.callText}>{SUPPORT_PHONE_LABEL}</Text>
        </Pressable>
        {done ? (
          <Text style={styles.ok}>Thanks — our team will reach out shortly.</Text>
        ) : (
          <>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field
              label="How can we help?"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ height: 110, textAlignVertical: "top" }}
            />
            {error ? <Text style={styles.err}>{error}</Text> : null}
            <PrimaryButton label="Request a free quote" onPress={submit} loading={loading} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary, marginBottom: 8 },
  p: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 12 },
  call: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  callText: { fontFamily: fonts.bold, color: colors.primary, textDecorationLine: "underline" },
  ok: { fontFamily: fonts.semibold, color: colors.primary, marginTop: 12 },
  err: { color: colors.sale, marginBottom: 8, fontFamily: fonts.medium },
});
