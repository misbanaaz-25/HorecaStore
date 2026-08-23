import { StackHeader } from "@/src/components/ScreenHeader";
import { EmptyState, Field, PrimaryButton } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
} from "@/src/store/slices/addressSlice";
import { colors, fonts, radius } from "@/src/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AddressesScreen() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => s.profile.customer);
  const addresses = useAppSelector((s) => s.address.addresses);
  const submitting = useAppSelector((s) => s.address.submitting);
  const [showForm, setShowForm] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    if (!customer) {
      router.replace("/login");
      return;
    }
    dispatch(fetchAddresses());
  }, [customer, dispatch]);

  const save = async () => {
    const result = await dispatch(
      addAddress({
        type: "shipping",
        address: address.trim(),
        country: "United States",
        state: state.trim(),
        city: city.trim(),
        zip_code: zip.trim(),
        is_default: addresses.length === 0,
      }),
    );
    if (addAddress.fulfilled.match(result)) {
      setShowForm(false);
      setAddress("");
      setCity("");
      setState("");
      setZip("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Addresses" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!addresses.length && !showForm ? (
          <EmptyState title="No saved addresses" subtitle="Add one for faster checkout." />
        ) : null}
        {addresses.map((a) => (
          <View key={a.id} style={[styles.card, a.is_default && styles.cardOn]}>
            <Text style={styles.addr}>
              {a.address}
              {"\n"}
              {a.related_city?.name ?? a.city}, {a.related_state?.name ?? a.state} {a.zip_code}
            </Text>
            <View style={styles.actions}>
              {!a.is_default ? (
                <Pressable onPress={() => dispatch(setDefaultAddress(a.id))}>
                  <Text style={styles.link}>Set default</Text>
                </Pressable>
              ) : (
                <Text style={styles.default}>Default</Text>
              )}
              <Pressable onPress={() => dispatch(deleteAddress(a.id))}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {showForm ? (
          <View style={{ marginTop: 8 }}>
            <Field label="Street address" value={address} onChangeText={setAddress} />
            <Field label="City" value={city} onChangeText={setCity} />
            <Field label="State" value={state} onChangeText={setState} />
            <Field label="ZIP" value={zip} onChangeText={setZip} keyboardType="number-pad" />
            <PrimaryButton label="Save address" onPress={save} loading={submitting} />
          </View>
        ) : (
          <PrimaryButton
            label="Add address"
            onPress={() => setShowForm(true)}
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>
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
  cardOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  addr: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, lineHeight: 20 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  link: { fontFamily: fonts.semibold, color: colors.primary },
  default: { fontFamily: fonts.semibold, color: colors.primary },
  delete: { fontFamily: fonts.semibold, color: colors.quote },
});
