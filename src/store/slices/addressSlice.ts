import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { KEYS, setJson } from "@/src/utils/storage";

export interface DefaultAddressCache {
  id: number;
  customer_id: number;
  type: string | null;
  address: string;
  address2: string | null;
  city_id: number;
  state_id: number | null;
  country_id: number;
  zip_code: string | null;
  is_default: boolean;
  country: string;
  state: string | null;
  city: string;
  related_country: { id: number; name: string } | null;
  related_state: { id: number; name: string } | null;
  related_city: { id: number; name: string } | null;
}

export interface CustomerAddress extends DefaultAddressCache {}

export interface AddressPayload {
  type: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  is_default: boolean;
}

interface AddressState {
  addresses: CustomerAddress[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  submitting: false,
  error: null,
};

const cacheDefault = async (addresses: CustomerAddress[]) => {
  const def = addresses.find((a) => a.is_default);
  if (def) await setJson(KEYS.defaultAddress, def);
};

export const fetchAddresses = createAsyncThunk("address/fetch", async () => {
  const res = await makeApiRequest<{ success: boolean; data: CustomerAddress[] }>(
    apiUrls.GET_CUSTOMER_ADDRESS,
  );
  const list = res.data ?? [];
  await cacheDefault(list);
  return list;
});

export const addAddress = createAsyncThunk(
  "address/add",
  async (payload: AddressPayload, { rejectWithValue }) => {
    try {
      await makeApiRequest(apiUrls.ADD_CUSTOMER_ADDRESS, {
        method: "POST",
        data: payload,
      });
      const res = await makeApiRequest<{ success: boolean; data: CustomerAddress[] }>(
        apiUrls.GET_CUSTOMER_ADDRESS,
      );
      const list = res.data ?? [];
      await cacheDefault(list);
      return list;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save address.";
      return rejectWithValue(msg);
    }
  },
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async (
    { id, payload }: { id: number; payload: AddressPayload },
    { rejectWithValue },
  ) => {
    try {
      await makeApiRequest(apiUrls.UPDATE_CUSTOMER_ADDRESS(id), {
        method: "PUT",
        data: payload,
      });
      const res = await makeApiRequest<{ success: boolean; data: CustomerAddress[] }>(
        apiUrls.GET_CUSTOMER_ADDRESS,
      );
      const list = res.data ?? [];
      await cacheDefault(list);
      return list;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update address.";
      return rejectWithValue(msg);
    }
  },
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await makeApiRequest(apiUrls.DELETE_CUSTOMER_ADDRESS(id), { method: "DELETE" });
      return id;
    } catch {
      return rejectWithValue("Failed to delete address.");
    }
  },
);

export const setDefaultAddress = createAsyncThunk(
  "address/default",
  async (addressId: number, { rejectWithValue }) => {
    try {
      await makeApiRequest(apiUrls.DEFAULT_CUSTOMER_ADDRESS, {
        method: "POST",
        data: { address_id: addressId },
      });
      return addressId;
    } catch {
      return rejectWithValue("Failed to set default address.");
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddresses(state) {
      state.addresses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addAddress.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.submitting = false;
        state.addresses = action.payload;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.submitting = false;
        state.addresses = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({
          ...a,
          is_default: a.id === action.payload,
        }));
      });
  },
});

export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
