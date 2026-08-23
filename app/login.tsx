import { Field, PrimaryButton } from "@/src/components/ui";
import { StackHeader } from "@/src/components/ScreenHeader";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { loginUser } from "@/src/store/slices/authSlice";
import { fetchCounts } from "@/src/store/slices/customerCountsSlice";
import { colors, fonts } from "@/src/theme";
import { cacheDefaultAddress, syncGuestCartAfterLogin, syncGuestWishlistAfterLogin } from "@/src/utils/sync";
import { router } from "expo-router";
import { ShieldCheck, Star, Truck } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.loading);
  const error = useAppSelector((s) => s.auth.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const submit = async () => {
    if (!email.trim() || !password) {
      setLocalError("Enter email and password.");
      return;
    }
    setLocalError("");
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
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Login" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>HorecaStore</Text>
        <Text style={styles.sub}>Sign in to manage orders and checkout faster.</Text>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {(localError || error) ? <Text style={styles.error}>{localError || error}</Text> : null}

        <Pressable onPress={() => router.push("/forgot-password")} style={{ marginBottom: 16 }}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <PrimaryButton label="Login" onPress={submit} loading={loading} />

        <Pressable onPress={() => router.push("/register")} style={{ marginTop: 18 }}>
          <Text style={styles.switch}>
            New here? <Text style={styles.link}>Create an account</Text>
          </Text>
        </Pressable>

        <View style={styles.trust}>
          <Trust icon={ShieldCheck} label="Secure checkout" />
          <Trust icon={Truck} label="US delivery" />
          <Trust icon={Star} label="Trusted brands" />
        </View>
      </ScrollView>
    </View>
  );
}

function Trust({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View style={styles.trustIcon}>
        <Icon size={16} color={colors.primary} />
      </View>
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20 },
  brand: { fontFamily: fonts.bold, fontSize: 26, color: colors.primary, marginBottom: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 22 },
  error: { color: colors.sale, fontFamily: fonts.medium, marginBottom: 10 },
  link: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 14 },
  switch: { textAlign: "center", fontFamily: fonts.regular, color: colors.textSecondary },
  trust: { flexDirection: "row", marginTop: 36 },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  trustLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, textAlign: "center" },
});
