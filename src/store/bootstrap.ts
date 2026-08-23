import { makeApiRequest, setForceCountry } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import type { CartItem, LocationData } from "@/src/types";
import { KEYS, getJson, getToken, setJson } from "@/src/utils/storage";
import { hydrateCart } from "./slices/cartSlice";
import { hydrateGuestWishlist, type WishlistGuestItem } from "./slices/wishlistSlice";
import { hydrateGuestSave, type GuestSaveItem } from "./slices/saveForLaterSlice";
import { setProfile, type CustomerProfile } from "./slices/profileSlice";
import { fetchCountryByName } from "./slices/countrySlice";
import { fetchCounts } from "./slices/customerCountsSlice";
import { fetchCart } from "./slices/cartSlice";
import { fetchWishlist } from "./slices/wishlistSlice";
import type { AppDispatch } from "./store";

export async function bootstrapApp(dispatch: AppDispatch) {
  const [cart, wishlist, saveLater, user, storedCountry] = await Promise.all([
    getJson<CartItem[]>(KEYS.cart, []),
    getJson<WishlistGuestItem[]>(KEYS.wishlist, []),
    getJson<GuestSaveItem[]>(KEYS.saveForLater, []),
    getJson<CustomerProfile | null>(KEYS.user, null),
    getJson<string>(KEYS.countryCode, "US"),
  ]);

  dispatch(hydrateCart(cart));
  dispatch(hydrateGuestWishlist(wishlist));
  dispatch(hydrateGuestSave(saveLater));

  let countryCode = storedCountry || "US";
  let countryName = "United States";

  try {
    const loc = await makeApiRequest<LocationData>(apiUrls.LOCATION);
    if (loc?.countryCode) {
      countryCode = loc.countryCode;
      countryName = loc.country || countryName;
      await setJson(KEYS.location, loc);
      await setJson(KEYS.countryCode, countryCode);
    }
  } catch {
    const cached = await getJson<LocationData | null>(KEYS.location, null);
    if (cached?.countryCode) {
      countryCode = cached.countryCode;
      countryName = cached.country || countryName;
    }
  }

  setForceCountry(countryCode);
  dispatch(fetchCountryByName(countryName));

  const token = await getToken();
  if (token && user) {
    dispatch(setProfile(user));
    dispatch(fetchCounts());
    dispatch(fetchWishlist());
    dispatch(fetchCart(countryName));
  }
}
