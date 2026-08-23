import { makeApiRequest, getForceCountry } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { KEYS, getJson, removeKey } from "./storage";
import type { CartItem } from "@/src/types";
import type { WishlistGuestItem } from "@/src/store/slices/wishlistSlice";
import type { LocationData } from "@/src/types";

export async function syncGuestCartAfterLogin(): Promise<void> {
  const items = await getJson<CartItem[]>(KEYS.cart, []);
  if (!items.length) {
    await removeKey(KEYS.cart);
    return;
  }

  const location = await getJson<LocationData | null>(KEYS.location, null);
  const country = location?.country ?? "";

  try {
    await makeApiRequest(apiUrls.CART_ADD_MULTIPLE, {
      method: "POST",
      data: {
        country,
        products: items.map((item) => ({
          product_id: item.productId,
          vendor_id: item.vendorId,
          quantity: item.quantity,
          shipping_charge: item.shippingCharge ?? 0,
          accessory_item_ids: item.accessoryItemIds ?? [],
        })),
      },
    });
  } catch {
    // server cart becomes source of truth
  }
  await removeKey(KEYS.cart);
}

export async function syncGuestWishlistAfterLogin(): Promise<void> {
  const items = await getJson<WishlistGuestItem[]>(KEYS.wishlist, []);
  if (!items.length) {
    await removeKey(KEYS.wishlist);
    return;
  }
  try {
    await makeApiRequest(apiUrls.WISHLIST_ADD_MULTIPLE, {
      method: "POST",
      data: { products: items.map((item) => ({ product_id: item.productId })) },
    });
  } catch {
    // ignore
  }
  await removeKey(KEYS.wishlist);
}

export async function cacheDefaultAddress(): Promise<void> {
  try {
    const res = await makeApiRequest<{ success: boolean; data: any[] }>(
      apiUrls.GET_CUSTOMER_ADDRESS,
    );
    const def = res.data?.find((a) => a.is_default);
    if (def) {
      const { setJson } = await import("./storage");
      await setJson(KEYS.defaultAddress, def);
    }
  } catch {
    // ignore
  }
}

export { getForceCountry };
