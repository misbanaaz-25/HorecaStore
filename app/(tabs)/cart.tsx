import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { QuantityStepper } from "@/src/components/QuantityStepper";
import { EmptyState, Loader, PrimaryButton } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchCart,
  removeApiEntry,
  removeItem,
  updateApiEntryQty,
  updateQuantity,
} from "@/src/store/slices/cartSlice";
import { fetchCounts } from "@/src/store/slices/customerCountsSlice";
import { colors, fonts, radius } from "@/src/theme";
import { fmtPrice, productHref, resolveStr } from "@/src/utils/product";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((s) => !!s.profile.customer);
  const country = useAppSelector((s) => s.country.data);
  const guestItems = useAppSelector((s) => s.cart.items);
  const rawProducts = useAppSelector((s) => s.cart.rawProducts);
  const apiStatus = useAppSelector((s) => s.cart.apiStatus);

  useEffect(() => {
    if (isLoggedIn && country?.name) dispatch(fetchCart(country.name));
  }, [dispatch, isLoggedIn, country?.name]);

  const rows = useMemo(() => {
    if (!isLoggedIn) {
      return guestItems.map((item) => ({
        key: item.productId,
        productId: item.productId,
        cartItemId: 0,
        name: item.name,
        image: item.image,
        sku: item.sku,
        price: item.price,
        qty: item.quantity,
        minQty: item.minQty,
        isFixed: item.isFixed,
        symbol: item.currencySymbol,
        url: item.url,
      }));
    }
    return rawProducts.map((cp: any) => {
      const p = cp.product ?? cp;
      const name =
        typeof p.name === "string" ? p.name : resolveStr(p.name ?? p.title);
      const images = Array.isArray(p.images)
        ? p.images
        : p.images?.en ?? p.image_urls?.en ?? [];
      return {
        key: cp.id,
        productId: cp.product_id ?? p.id,
        cartItemId: cp.id,
        name,
        image: images[0] ?? "",
        sku: p.sku ?? "",
        price: Number(cp.unit_price ?? cp.price ?? p.sale_price ?? p.price ?? 0),
        qty: Number(cp.quantity ?? 1),
        minQty: Number(p.min_quantity ?? 1),
        isFixed: !!p.is_fixed,
        symbol: p.currency?.symbol ?? "$",
        url: p.url ?? "",
      };
    });
  }, [guestItems, isLoggedIn, rawProducts]);

  const subtotal = rows.reduce((s, r) => s + r.price * r.qty, 0);

  const changeQty = async (row: (typeof rows)[0], qty: number) => {
    if (isLoggedIn && row.cartItemId) {
      dispatch(updateApiEntryQty({ cartItemId: row.cartItemId, quantity: qty }));
      try {
        await makeApiRequest(apiUrls.CART_UPDATE_QTY(row.cartItemId), {
          method: "PUT",
          data: { quantity: qty },
        });
        dispatch(fetchCounts());
      } catch {
        if (country?.name) dispatch(fetchCart(country.name));
      }
    } else {
      dispatch(updateQuantity({ productId: row.productId, quantity: qty }));
    }
  };

  const remove = async (row: (typeof rows)[0]) => {
    if (isLoggedIn && row.cartItemId) {
      dispatch(removeApiEntry(row.cartItemId));
      try {
        await makeApiRequest(apiUrls.CART_REMOVE(row.cartItemId), { method: "DELETE" });
        dispatch(fetchCounts());
      } catch {
        if (country?.name) dispatch(fetchCart(country.name));
      }
    } else {
      dispatch(removeItem(row.productId));
    }
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Your Cart</Text>
      {isLoggedIn && apiStatus === "loading" && !rows.length ? (
        <Loader />
      ) : !rows.length ? (
        <EmptyState
          title="Your cart is empty"
          subtitle="Add commercial kitchen equipment to get started."
          action="Start shopping"
          onAction={() => router.push("/(tabs)")}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 220 }}>
            {rows.map((row) => (
              <Pressable
                key={row.key}
                style={styles.row}
                onPress={() => router.push(productHref(row.url) as any)}
              >
                <Image source={{ uri: row.image }} style={styles.img} contentFit="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {row.name}
                  </Text>
                  {row.sku ? <Text style={styles.sku}>Model No: {row.sku}</Text> : null}
                  <Text style={styles.price}>
                    {row.symbol}
                    {fmtPrice(row.price)}
                  </Text>
                  <View style={styles.actions}>
                    <QuantityStepper
                      count={row.qty}
                      min={row.minQty}
                      isFixed={row.isFixed}
                      onChange={(q) => changeQty(row, q)}
                    />
                    <Pressable onPress={() => remove(row)} hitSlop={8}>
                      <Trash2 size={18} color={colors.sale} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.summary}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumVal}>${fmtPrice(subtotal)}</Text>
            </View>
            <Text style={styles.note}>Shipping and tax calculated at checkout.</Text>
            <PrimaryButton
              label={isLoggedIn ? "Confirm & Pay" : "Login to checkout"}
              onPress={() => router.push(isLoggedIn ? "/checkout" : "/login")}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  img: { width: 84, height: 84, backgroundColor: colors.muted, borderRadius: 6 },
  name: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  sku: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  price: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginTop: 6 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summary: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 92,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  sumLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  sumVal: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 12 },
});
