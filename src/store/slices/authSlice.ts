import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";
import { KEYS, removeAuthToken, setAuthToken, setJson } from "@/src/utils/storage";
import { clearProfile, setProfile, type CustomerProfile } from "./profileSlice";
import { clearApiEntries, clearCart } from "./cartSlice";
import { clearWishlist } from "./wishlistSlice";
import { clearCounts } from "./customerCountsSlice";
import { clearSaveForLater } from "./saveForLaterSlice";
import { clearAddresses } from "./addressSlice";

interface AuthState {
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { loading: false, error: null };

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await makeApiRequest<{
        success: boolean;
        message: string;
        token: string;
        customer: CustomerProfile;
      }>(apiUrls.LOGIN, {
        method: "POST",
        data: credentials,
      });
      await setAuthToken(res.token);
      await setJson(KEYS.user, res.customer);
      dispatch(setProfile(res.customer));
      return res.customer;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      return rejectWithValue(msg);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  try {
    await makeApiRequest(apiUrls.LOGOUT, { method: "POST" });
  } catch {
    // local logout still proceeds
  } finally {
    await removeAuthToken();
    dispatch(clearProfile());
    dispatch(clearCart());
    dispatch(clearApiEntries());
    dispatch(clearWishlist());
    dispatch(clearCounts());
    dispatch(clearSaveForLater());
    dispatch(clearAddresses());
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
