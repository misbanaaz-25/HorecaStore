import { StackHeader } from "@/src/components/ScreenHeader";
import { Field, PrimaryButton } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { updateProfile } from "@/src/store/slices/profileSlice";
import { colors, fonts } from "@/src/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => s.profile.customer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customer) {
      router.replace("/login");
      return;
    }
    setName(customer.name);
    setPhone(customer.mobile_number ?? "");
  }, [customer]);

  const save = async () => {
    if (!customer) return;
    setLoading(true);
    setMsg("");
    const result = await dispatch(
      updateProfile({
        name: name.trim(),
        country_code: customer.country_code ?? "+1",
        mobile_number: phone.replace(/\D/g, ""),
        type: customer.type || "Private",
        business_name: customer.business_detail?.business_name,
      }),
    );
    setLoading(false);
    setMsg(updateProfile.fulfilled.match(result) ? "Profile updated." : "Update failed.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Account settings" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Field label="Full name" value={name} onChangeText={setName} />
        <Field label="Email" value={customer?.email ?? ""} editable={false} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {msg ? (
          <Text style={{ fontFamily: fonts.medium, color: colors.primary, marginBottom: 10 }}>{msg}</Text>
        ) : null}
        <PrimaryButton label="Save changes" onPress={save} loading={loading} />
      </ScrollView>
    </View>
  );
}
