import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { StackHeader } from "@/src/components/ScreenHeader";
import { EmptyState, Loader, PrimaryButton } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchAddresses } from "@/src/store/slices/addressSlice";
import { clearApiEntries, fetchCart } from "@/src/store/slices/cartSlice";
import { colors, fonts, radius } from "@/src/theme";
import { WEB_URL } from "@/src/theme";
import { fmtPrice, resolveStr } from "@/src/utils/product";
import { DELIVERY_FEES } from "@/src/utils/shipping";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => s.profile.customer);
  const addresses = useAppSelector((s) => s.address.addresses);
  const rawProducts = useAppSelector((s) => s.cart.rawProducts);
  const country = useAppSelector((s) => s.country.data);
  const [selected, setSelected] = useState<number | null>(null);
  const [lift, setLift] = useState(false);
  const [residential, setResidential] = useState(false);
  const [inside, setInside] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<number | null>(null);

  useEffect(() => {
    if (!customer) {
      router.replace("/login");
      return;
    }
    dispatch(fetchAddresses());
    if (country?.name) dispatch(fetchCart(country.name));
  }, [country?.name, customer, dispatch]);

  useEffect(() => {
    const def = addresses.find((a) => a.is_default);
    if (def) setSelected(def.id);
    else if (addresses[0]) setSelected(addresses[0].id);
  }, [addresses]);

  const lines = useMemo(
    () =>
      rawProducts.map((cp: any) => {
        const p = cp.product ?? cp;
        const name = typeof p.name === "string" ? p.name : resolveStr(p.name);
        const qty = Number(cp.quantity ?? 1);
        const price = Number(cp.unit_price ?? cp.price ?? p.sale_price ?? p.price ?? 0);
        const ship = Number(cp.shipping_charge ?? 0);
        return {
          product_id: cp.product_id ?? p.id,
          vendor_id: cp.vendor_id ?? p.suppliers?.[0]?.vendor_id ?? 0,
          quantity: qty,
          shipping_charge: ship,
          unit_price: price,
          accessory_item_ids: cp.accessory_item_ids ?? [],
          name,
        };
      }),
    [rawProducts],
  );

  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  const shipping = lines.reduce((s, l) => s + l.shipping_charge, 0);
  const extras =
    (lift ? DELIVERY_FEES.liftGate : 0) +
    (residential ? DELIVERY_FEES.residential : 0) +
    (inside ? DELIVERY_FEES.insideDelivery : 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + extras + tax;

  const place = async () => {
    if (!customer || !selected) {
      setError("Please add and select a delivery address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await makeApiRequest<any>(apiUrls.PLACE_ORDER, {
        method: "POST",
        data: {
          customer_id: customer.id,
          customer_address_id: selected,
          tax_percentage: 8.25,
          ship_all_at_once: 1,
          is_lift_gate: lift ? 1 : 0,
          is_residential_address: residential ? 1 : 0,
          is_inside_delivery: inside ? 1 : 0,
          separate_deliveries: 0,
          products: lines,
          coupon_id: "",
          discount: "0",
          is_reserved: 0,
          pay_with_cheque: 1,
          payment_mode: "Cheque",
        },
      });
      const id = res?.data?.id ?? res?.order?.id ?? res?.id;
      dispatch(clearApiEntries());
      setDoneId(id ?? 0);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not place order. You can pay securely on the website.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return <Loader />;

  if (doneId != null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <StackHeader title="Order placed" />
        <View style={{ padding: 24 }}>
          <Text style={styles.doneTitle}>Thank you</Text>
          <Text style={styles.doneSub}>
            Your order has been submitted. Our team will confirm payment and delivery shortly.
          </Text>
          <PrimaryButton
            label="View orders"
            onPress={() => router.replace("/orders")}
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StackHeader title="Checkout" />
      {!lines.length ? (
        <EmptyState title="Cart is empty" action="Go to cart" onAction={() => router.replace("/(tabs)/cart")} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={styles.h}>Delivery address</Text>
          {addresses.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setSelected(a.id)}
              style={[styles.addr, selected === a.id && styles.addrOn]}
            >
              <Text style={styles.addrText}>
                {a.address}, {a.related_city?.name ?? a.city}, {a.related_state?.name ?? a.state}{" "}
                {a.zip_code}
              </Text>
            </Pressable>
          ))}
          <PrimaryButton
            label="Manage addresses"
            variant="outline"
            onPress={() => router.push("/addresses")}
            style={{ marginBottom: 18 }}
          />

          <Text style={styles.h}>Delivery options</Text>
          <ToggleRow label="Lift gate (+$75)" value={lift} onChange={setLift} />
          <ToggleRow label="Residential (+$199)" value={residential} onChange={setResidential} />
          <ToggleRow label="Inside delivery (+$249)" value={inside} onChange={setInside} />

          <Text style={[styles.h, { marginTop: 16 }]}>Summary</Text>
          <Row k="Subtotal" v={`$${fmtPrice(subtotal)}`} />
          <Row k="Shipping" v={`$${fmtPrice(shipping)}`} />
          <Row k="Delivery options" v={`$${fmtPrice(extras)}`} />
          <Row k="Est. tax" v={`$${fmtPrice(tax)}`} />
          <Row k="Total" v={`$${fmtPrice(total)}`} bold />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={`Place order · $${fmtPrice(total)}`}
            onPress={place}
            loading={loading}
            style={{ marginTop: 16 }}
          />
          <PrimaryButton
            label="Pay with card on website"
            variant="outline"
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/checkout`)}
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      )}
    </View>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.k, bold && styles.bold]}>{k}</Text>
      <Text style={[styles.v, bold && styles.bold]}>{v}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.k}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 10 },
  addr: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  addrOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  addrText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, lineHeight: 18 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  k: { fontFamily: fonts.regular, color: colors.textSecondary },
  v: { fontFamily: fonts.medium, color: colors.text },
  bold: { fontFamily: fonts.bold, color: colors.text },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  error: { color: colors.sale, marginTop: 12, fontFamily: fonts.medium },
  doneTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary },
  doneSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
});
