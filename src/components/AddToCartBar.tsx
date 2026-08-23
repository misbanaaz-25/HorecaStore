import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addApiEntry,
  addItem,
  fetchCart,
} from "@/src/store/slices/cartSlice";
import { fetchCounts } from "@/src/store/slices/customerCountsSlice";
import { removeGuestSaveItem, removeSaveForLater } from "@/src/store/slices/saveForLaterSlice";
import { colors, fonts, radius } from "@/src/theme";
import type { RawApiProduct } from "@/src/types";
import { KEYS, getJson, getToken } from "@/src/utils/storage";
import { normalizeProduct } from "@/src/utils/product";
import { getShippingCharge, getShippingChargeFromAddress } from "@/src/utils/shipping";
import { CheckCircle, ShoppingCart } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { QuantityStepper } from "./QuantityStepper";
import { QuoteModal } from "./QuoteModal";
import type { DefaultAddressCache } from "@/src/store/slices/addressSlice";
import type { LocationData } from "@/src/types";

export function AddToCartBar({
  product,
  accessoryItemIds = [],
  compact,
}: {
  product: RawApiProduct;
  accessoryItemIds?: number[];
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const n = normalizeProduct(product);
  const country = useAppSelector((s) => s.country.data);
  const isLoggedIn = useAppSelector((s) => !!s.profile.customer);
  const sflIds = useAppSelector((s) => s.saveForLater.ids);
  const [qty, setQty] = useState(n.minQty);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    setQty(n.minQty);
  }, [n.minQty, n.id]);

  const add = async () => {
    if (n.isQuote) {
      setQuoteOpen(true);
      return;
    }
    const token = await getToken();
    const location = await getJson<LocationData | null>(KEYS.location, null);
    const defaultAddr = token
      ? await getJson<DefaultAddressCache | null>(KEYS.defaultAddress, null)
      : null;
    const shippingCharge = defaultAddr
      ? getShippingChargeFromAddress(defaultAddr)
      : getShippingCharge(
          location?.city ?? "",
          location?.regionName ?? "",
          location?.countryCode ?? location?.country ?? "",
        );

    if (token) {
      setLoading(true);
      try {
        const res = await makeApiRequest<any>(apiUrls.CART_ADD, {
          method: "POST",
          data: {
            country: country?.name ?? "",
            product_id: n.id,
            vendor_id: n.vendorId,
            quantity: qty,
            shipping_charge: shippingCharge,
            accessory_item_ids: accessoryItemIds,
          },
        });
        const itemId: number =
          res?.data?.id ??
          res?.data?.cart_product?.id ??
          res?.data?.cart_item?.id ??
          res?.id ??
          0;
        dispatch(addApiEntry({ cartItemId: itemId, productId: n.id, quantity: qty }));
        dispatch(fetchCounts());
        if (sflIds.includes(n.id)) dispatch(removeSaveForLater({ productId: n.id }));
        if (country?.name) dispatch(fetchCart(country.name));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    } else {
      dispatch(
        addItem({
          productId: n.id,
          name: n.name,
          url: n.url,
          parentCategoryUrl: product.parent_category_url ?? "",
          image: n.image,
          price: n.activePrice,
          originalPrice: n.originalPrice,
          hasSale: n.hasSale,
          currencySymbol: n.currencySymbol,
          quantity: qty,
          minQty: n.minQty,
          isFixed: n.isFixed,
          isQuote: n.isQuote,
          sellUnit: n.sellUnit,
          sku: n.sku,
          vendorId: n.vendorId,
          shippingCharge,
          subTotal: n.activePrice * qty,
          totalPrice: n.activePrice * qty + shippingCharge,
          accessoryItemIds,
          rawProduct: product,
        }),
      );
      dispatch(removeGuestSaveItem({ productId: n.id }));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (compact) {
    return (
      <>
        <Pressable
          onPress={add}
          disabled={loading}
          style={[styles.compactBtn, n.isQuote && { backgroundColor: colors.quote }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : added ? (
            <CheckCircle size={14} color={colors.white} />
          ) : n.isQuote ? null : (
            <ShoppingCart size={14} color={colors.white} />
          )}
          <Text style={styles.compactText}>
            {added ? "Added!" : n.isQuote ? "Request A Quote" : "Add To Cart"}
          </Text>
        </Pressable>
        <QuoteModal visible={quoteOpen} onClose={() => setQuoteOpen(false)} product={product} />
      </>
    );
  }

  return (
    <>
      <View style={styles.row}>
        {!n.isQuote ? (
          <QuantityStepper count={qty} min={n.minQty} onChange={setQty} isFixed={n.isFixed} />
        ) : null}
        <Pressable
          onPress={add}
          disabled={loading}
          style={[styles.fullBtn, n.isQuote && { backgroundColor: colors.quote }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : added ? (
            <CheckCircle size={16} color={colors.white} />
          ) : n.isQuote ? null : (
            <ShoppingCart size={16} color={colors.white} />
          )}
          <Text style={styles.fullText}>
            {added ? "Added!" : n.isQuote ? "Request A Quote" : "Add To Cart"}
          </Text>
        </Pressable>
      </View>
      <QuoteModal visible={quoteOpen} onClose={() => setQuoteOpen(false)} product={product} />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  compactBtn: {
    flex: 1,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  compactText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 11 },
  fullBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 14 },
});
