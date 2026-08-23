import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";

export interface WishlistGuestItem {
  productId: number;
  rawProduct: any;
}

type FetchStatus = "idle" | "loading" | "succeeded" | "failed";

interface WishlistState {
  ids: number[];
  guestItems: WishlistGuestItem[];
  toggling: number[];
  hydrated: boolean;
  apiEntries: any[];
  fetchStatus: FetchStatus;
}

const initialState: WishlistState = {
  ids: [],
  guestItems: [],
  toggling: [],
  hydrated: false,
  apiEntries: [],
  fetchStatus: "idle",
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    const res = await makeApiRequest<any>(apiUrls.WISHLIST_GET);
    return (res?.wishlist ?? (Array.isArray(res) ? res : [])) as any[];
  },
  {
    condition: (_, { getState }) => {
      const status = (getState() as { wishlist: WishlistState }).wishlist.fetchStatus;
      return status !== "loading" && status !== "succeeded";
    },
  },
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (
    { productId, currentlyInWishlist }: { productId: number; currentlyInWishlist: boolean },
    { rejectWithValue },
  ) => {
    try {
      if (currentlyInWishlist) {
        await makeApiRequest(apiUrls.WISHLIST_REMOVE, {
          method: "DELETE",
          params: { product_id: productId },
        });
      } else {
        await makeApiRequest(apiUrls.WISHLIST_ADD, {
          method: "POST",
          data: { product_id: productId },
        });
      }
      return { productId, inWishlist: !currentlyInWishlist };
    } catch {
      return rejectWithValue({ productId, revert: currentlyInWishlist });
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    seedWishlistIds(state, action: PayloadAction<number[]>) {
      for (const id of action.payload) {
        if (!state.ids.includes(id)) state.ids.push(id);
      }
      state.hydrated = true;
    },
    hydrateGuestWishlist(state, action: PayloadAction<WishlistGuestItem[]>) {
      state.guestItems = action.payload;
      state.hydrated = true;
      for (const item of action.payload) {
        if (!state.ids.includes(item.productId)) state.ids.push(item.productId);
      }
    },
    toggleGuestWishlistItem(
      state,
      action: PayloadAction<{ productId: number; rawProduct: any }>,
    ) {
      const { productId, rawProduct } = action.payload;
      const existingIdx = state.guestItems.findIndex((i) => i.productId === productId);
      if (existingIdx >= 0) {
        state.guestItems.splice(existingIdx, 1);
        state.ids = state.ids.filter((id) => id !== productId);
      } else {
        state.guestItems.push({ productId, rawProduct });
        if (!state.ids.includes(productId)) state.ids.push(productId);
      }
    },
    resetWishlistFetch(state) {
      state.fetchStatus = "idle";
    },
    clearWishlist(state) {
      state.ids = [];
      state.guestItems = [];
      state.toggling = [];
      state.hydrated = false;
      state.apiEntries = [];
      state.fetchStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.apiEntries = action.payload;
        state.hydrated = true;
        for (const entry of action.payload) {
          const pid = (entry.product_id ?? entry.product?.id) as number;
          if (pid && !state.ids.includes(pid)) state.ids.push(pid);
        }
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.fetchStatus = "failed";
      })
      .addCase(toggleWishlistItem.pending, (state, action) => {
        const { productId, currentlyInWishlist } = action.meta.arg;
        state.toggling.push(productId);
        if (currentlyInWishlist) {
          state.ids = state.ids.filter((id) => id !== productId);
          state.apiEntries = state.apiEntries.filter((e) => e.product_id !== productId);
        } else if (!state.ids.includes(productId)) {
          state.ids.push(productId);
        }
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.toggling = state.toggling.filter((id) => id !== action.payload.productId);
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        const payload = action.payload as { productId?: number; revert?: boolean } | undefined;
        const productId = payload?.productId;
        if (!productId) return;
        state.toggling = state.toggling.filter((id) => id !== productId);
        if (payload?.revert) {
          if (!state.ids.includes(productId)) state.ids.push(productId);
        } else {
          state.ids = state.ids.filter((id) => id !== productId);
        }
      });
  },
});

export const {
  seedWishlistIds,
  hydrateGuestWishlist,
  toggleGuestWishlistItem,
  resetWishlistFetch,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
