import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeApiRequest } from "@/src/api/client";
import { apiUrls } from "@/src/api/endpoints";

export interface CountryData {
  id: number;
  name: string;
  phone_code: string;
  icon: string | null;
  currency_id: number;
  currency_title: string;
  currency_symbol: string;
  margin: number;
}

interface CountryState {
  data: CountryData | null;
  loading: boolean;
}

const initialState: CountryState = { data: null, loading: false };

export const fetchCountryByName = createAsyncThunk(
  "country/fetchByName",
  async (countryName: string, { rejectWithValue }) => {
    try {
      const res = await makeApiRequest<{ success: boolean; data: CountryData }>(
        `${apiUrls.COUNTRIES}/${encodeURIComponent(countryName)}`,
      );
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch country data");
    }
  },
  {
    condition: (countryName, { getState }) => {
      if (!countryName) return false;
      const state = getState() as { country: CountryState };
      const current = state.country.data?.name;
      return (
        (!current || current.toLowerCase() !== countryName.toLowerCase()) &&
        !state.country.loading
      );
    },
  },
);

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountryByName.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountryByName.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCountryByName.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default countrySlice.reducer;
