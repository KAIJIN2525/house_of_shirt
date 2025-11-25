import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Calculate delivery cost and time with speed option
export const calculateDelivery = createAsyncThunk(
  "delivery/calculate",
  async (
    { state, city, speedOption = "standard", orderTotal = 0 },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/calculate`,
        { state, city, speedOption, orderTotal }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all available delivery locations
export const getDeliveryLocations = createAsyncThunk(
  "delivery/locations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/locations`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check if delivery is available to a location
export const checkDeliveryAvailability = createAsyncThunk(
  "delivery/check",
  async ({ state, city }, { rejectWithValue }) => {
    try {
      const url = city
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/delivery/check/${state}/${city}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/delivery/check/${state}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  deliveryInfo: null, // { state, city, distance, deliveryCost, deliveryTime, estimatedDeliveryDate, deliveryOptions }
  selectedSpeedOption: "standard", // Current selected delivery speed
  locations: [], // All available locations
  loading: false,
  error: null,
  isCalculated: false,
};

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    resetDelivery: (state) => {
      state.deliveryInfo = null;
      state.selectedSpeedOption = "standard";
      state.loading = false;
      state.error = null;
      state.isCalculated = false;
    },
    clearDeliveryError: (state) => {
      state.error = null;
    },
    setSelectedSpeedOption: (state, action) => {
      state.selectedSpeedOption = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate Delivery
      .addCase(calculateDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isCalculated = false;
      })
      .addCase(calculateDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryInfo = action.payload;
        state.isCalculated = true;
      })
      .addCase(calculateDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
        state.isCalculated = false;
      })

      // Get Delivery Locations
      .addCase(getDeliveryLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeliveryLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(getDeliveryLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Check Delivery Availability
      .addCase(checkDeliveryAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkDeliveryAvailability.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkDeliveryAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      });
  },
});

export const { resetDelivery, clearDeliveryError, setSelectedSpeedOption } =
  deliverySlice.actions;
export default deliverySlice.reducer;
