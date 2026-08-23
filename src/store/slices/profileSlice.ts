import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { KEYS, setJson } from "@/src/utils/storage";

export interface BusinessDetail {
  id: number;
  customer_id: number;
  business_name: string;
  business_licence: string | null;
  trn_number: string | null;
}

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  country_code: string | null;
  mobile_number: string | null;
  type: string;
  business_detail: BusinessDetail | null;
}

interface ProfileState {
  customer: CustomerProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  customer: null,
  loading: true,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await makeApiRequest<{ success: boolean; customer: CustomerProfile }>(
        apiUrls.GETMYPROFILE,
      );
      return res.customer;
    } catch {
      return rejectWithValue("Failed to fetch profile");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (
    payload: {
      name: string;
      country_code: string;
      mobile_number: string;
      type: string;
      business_name?: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await makeApiRequest<{
        success: boolean;
        message: string;
        customer: CustomerProfile;
      }>(apiUrls.UPDATE_PROFILE, { method: "POST", data: payload });
      dispatch(setProfile(res.customer));
      await setJson(KEYS.user, res.customer);
      return res.message;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update profile.";
      return rejectWithValue(msg);
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<CustomerProfile>) {
      state.customer = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearProfile(state) {
      state.customer = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
