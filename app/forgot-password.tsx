import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { Field, PrimaryButton } from "@/src/components/ui";
import { StackHeader } from "@/src/components/ScreenHeader";
import { colors, fonts } from "@/src/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await makeApiRequest(apiUrls.FORGOT_PASSWORD, {
        method: "POST",
        data: { email: email.trim(), type: "customer" },
      });
      setMsg("If an account exists, a reset link has been sent to your email.");
    } catch {
      setError("Unable to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Forgot password" />
      <View style={{ padding: 20 }}>
        <Text style={styles.sub}>
          Enter the email on your HorecaStore account and we'll send reset instructions.
        </Text>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {error ? <Text style={{ color: colors.sale, marginBottom: 8 }}>{error}</Text> : null}
        {msg ? <Text style={{ color: colors.primary, marginBottom: 8 }}>{msg}</Text> : null}
        <PrimaryButton label="Send reset link" onPress={submit} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 18, lineHeight: 20 },
});
