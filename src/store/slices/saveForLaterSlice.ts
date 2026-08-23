import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";

export interface GuestSaveItem {
  productId: number;
  quantity: number;
  vendorId: number;
  rawProduct: any;
}

interface SaveForLaterState {
  ids: number[];
  guestItems: GuestSaveItem[];
  apiEntries: any[];
}

const initialState: SaveForLaterState = {
  ids: [],
  guestItems: [],
  apiEntries: [],
};

export const fetchSaveForLater = createAsyncThunk("saveForLater/fetch", async () => {
  const res: any = await makeApiRequest(apiUrls.SAVE_FOR_LATER, { method: "GET" });
  return (res?.data?.data ?? res?.data ?? []) as any[];
});

export const addSaveForLater = createAsyncThunk(
  "saveForLater/add",
  async (payload: { productId: number; quantity: number; vendorId: number }) => {
    await makeApiRequest(apiUrls.SAVE_FOR_LATER, {
      method: "POST",
      data: {
        product_id: payload.productId,
        quantity: payload.quantity,
        vendor_id: payload.vendorId,
      },
    });
    return payload.productId;
  },
);

export const removeSaveForLater = createAsyncThunk(
  "saveForLater/remove",
  async ({ productId }: { productId: number }) => {
    await makeApiRequest(`${apiUrls.SAVE_FOR_LATER_REMOVE}/${productId}`, {
      method: "DELETE",
    });
    return productId;
  },
);

const saveForLaterSlice = createSlice({
  name: "saveForLater",
  initialState,
  reducers: {
    hydrateGuestSave(state, action: PayloadAction<GuestSaveItem[]>) {
      state.guestItems = action.payload;
      state.ids = action.payload.map((i) => i.productId);
    },
    toggleGuestSaveItem(state, action: PayloadAction<GuestSaveItem>) {
      const idx = state.guestItems.findIndex((i) => i.productId === action.payload.productId);
      if (idx >= 0) {
        state.guestItems.splice(idx, 1);
        state.ids = state.ids.filter((id) => id !== action.payload.productId);
      } else {
        state.guestItems.push(action.payload);
        state.ids.push(action.payload.productId);
      }
    },
    removeGuestSaveItem(state, action: PayloadAction<{ productId: number }>) {
      state.guestItems = state.guestItems.filter((i) => i.productId !== action.payload.productId);
      state.ids = state.ids.filter((id) => id !== action.payload.productId);
    },
    clearSaveForLater() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaveForLater.fulfilled, (state, action) => {
        state.apiEntries = action.payload;
        state.ids = action.payload
          .map((e) => e.product_id as number)
          .filter(Boolean);
      })
      .addCase(addSaveForLater.fulfilled, (state, action) => {
        if (!state.ids.includes(action.payload)) state.ids.push(action.payload);
      })
      .addCase(removeSaveForLater.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        state.apiEntries = state.apiEntries.filter((e) => e.product_id !== action.payload);
      });
  },
});

export const {
  hydrateGuestSave,
  toggleGuestSaveItem,
  removeGuestSaveItem,
  clearSaveForLater,
} = saveForLaterSlice.actions;

export default saveForLaterSlice.reducer;
