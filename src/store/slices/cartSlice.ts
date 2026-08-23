import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import type { ApiCartEntry, CartItem } from "@/src/types";

type ApiStatus = "idle" | "loading" | "succeeded" | "failed";

interface CartState {
  items: CartItem[];
  apiEntries: ApiCartEntry[];
  rawProducts: any[];
  cartShippingCharge: string;
  apiStatus: ApiStatus;
  lastAddedAt: number;
}

const initialState: CartState = {
  items: [],
  apiEntries: [],
  rawProducts: [],
  cartShippingCharge: "0.00",
  apiStatus: "idle",
  lastAddedAt: 0,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (countryName: string) => {
    const res = await makeApiRequest<any>(apiUrls.CART_GET, {
      params: { country: countryName },
    });
    const data = res?.data ?? {};
    const products: any[] = data.customer_cart_products ?? [];
    return {
      entries: products.map((cp) => ({
        cartItemId: cp.id as number,
        productId: cp.product_id as number,
        quantity: cp.quantity as number,
      })) as ApiCartEntry[],
      rawProducts: products,
      cartShippingCharge: data.shipping_charge ?? "0.00",
    };
  },
  {
    condition: (_, { getState }) => {
      const status: ApiStatus = (getState() as { cart: CartState }).cart.apiStatus;
      return status !== "loading";
    },
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.subTotal = existing.price * existing.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        item.subTotal = item.price * item.quantity;
      }
    },
    clearCart(state) {
      state.items = [];
    },
    addApiEntry(state, action: PayloadAction<ApiCartEntry>) {
      const existing = state.apiEntries.find((e) => e.productId === action.payload.productId);
      if (existing) {
        existing.cartItemId = action.payload.cartItemId;
        existing.quantity = action.payload.quantity;
      } else {
        state.apiEntries.push(action.payload);
      }
      state.lastAddedAt = Date.now();
    },
    updateApiEntryQty(
      state,
      action: PayloadAction<{ cartItemId: number; quantity: number }>,
    ) {
      const entry = state.apiEntries.find((e) => e.cartItemId === action.payload.cartItemId);
      if (entry) entry.quantity = action.payload.quantity;
      const raw = state.rawProducts.find((p) => p.id === action.payload.cartItemId);
      if (raw) raw.quantity = action.payload.quantity;
    },
    removeApiEntry(state, action: PayloadAction<number>) {
      state.apiEntries = state.apiEntries.filter((e) => e.cartItemId !== action.payload);
      state.rawProducts = state.rawProducts.filter((p) => p.id !== action.payload);
    },
    resetApiStatus(state) {
      state.apiStatus = "idle";
    },
    clearApiEntries(state) {
      state.apiEntries = [];
      state.rawProducts = [];
      state.apiStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.apiStatus = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.apiStatus = "succeeded";
        state.apiEntries = action.payload.entries;
        state.rawProducts = action.payload.rawProducts;
        state.cartShippingCharge = action.payload.cartShippingCharge;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.apiStatus = "failed";
      });
  },
});

export const {
  hydrateCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  addApiEntry,
  updateApiEntryQty,
  removeApiEntry,
  resetApiStatus,
  clearApiEntries,
} = cartSlice.actions;

export default cartSlice.reducer;
