import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { Field, PrimaryButton } from "@/src/components/ui";
import { StackHeader } from "@/src/components/ScreenHeader";
import { useAppDispatch } from "@/src/store/hooks";
import { loginUser } from "@/src/store/slices/authSlice";
import { fetchCounts } from "@/src/store/slices/customerCountsSlice";
import { colors, fonts } from "@/src/theme";
import { cacheDefaultAddress, syncGuestCartAfterLogin, syncGuestWishlistAfterLogin } from "@/src/utils/sync";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"Private" | "Business">("Private");
  const [business, setBusiness] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await makeApiRequest(apiUrls.REGISTER, {
        method: "POST",
        data: {
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: confirm,
          type,
          country_code: "+1",
          mobile_number: phone.trim(),
          ...(type === "Business" ? { business_name: business.trim() } : {}),
        },
      });
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(result)) {
        await Promise.allSettled([
          syncGuestCartAfterLogin(),
          syncGuestWishlistAfterLogin(),
          cacheDefaultAddress(),
        ]);
        dispatch(fetchCounts());
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Create account" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Join HorecaStore</Text>
        <View style={styles.types}>
          {(["Private", "Business"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeBtn, type === t && styles.typeOn]}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Full name" value={name} onChangeText={setName} />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {type === "Business" ? (
          <Field label="Business name" value={business} onChangeText={setBusiness} />
        ) : null}
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Create account" onPress={submit} loading={loading} />
        <Pressable onPress={() => router.push("/login")} style={{ marginTop: 16 }}>
          <Text style={styles.switch}>
            Already have an account? <Text style={{ color: colors.primary, fontFamily: fonts.semibold }}>Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  brand: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, marginBottom: 16 },
  types: { flexDirection: "row", gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  typeOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontFamily: fonts.medium, color: colors.textSecondary },
  typeTextOn: { color: colors.white },
  error: { color: colors.sale, marginBottom: 10, fontFamily: fonts.medium },
  switch: { textAlign: "center", fontFamily: fonts.regular, color: colors.textSecondary },
});
