import { configureStore, Middleware } from "@reduxjs/toolkit";
import profileReducer from "./slices/profileSlice";
import countryReducer from "./slices/countrySlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import customerCountsReducer from "./slices/customerCountsSlice";
import addressReducer from "./slices/addressSlice";
import saveForLaterReducer from "./slices/saveForLaterSlice";
import { KEYS, setJson } from "@/src/utils/storage";

const persistMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type ?? "";
  const state = storeApi.getState() as {
    cart: { items: unknown };
    wishlist: { guestItems: unknown };
    saveForLater: { guestItems: unknown };
  };

  if (type.startsWith("cart/") && !type.includes("fetchCart")) {
    void setJson(KEYS.cart, state.cart.items);
  }
  if (
    type === "wishlist/toggleGuestWishlistItem" ||
    type === "wishlist/hydrateGuestWishlist" ||
    type === "wishlist/clearWishlist"
  ) {
    void setJson(KEYS.wishlist, state.wishlist.guestItems);
  }
  if (type.startsWith("saveForLater/") && type.includes("Guest")) {
    void setJson(KEYS.saveForLater, state.saveForLater.guestItems);
  }
  return result;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    country: countryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    customerCounts: customerCountsReducer,
    address: addressReducer,
    saveForLater: saveForLaterReducer,
  },
  middleware: (getDefault) => getDefault().concat(persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
