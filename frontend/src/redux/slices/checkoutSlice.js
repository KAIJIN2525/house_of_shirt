import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to create a checkout session
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGuestCheckout = createAsyncThunk(
  "cart/createGuestCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/guest`,
        checkoutData
      );

      // Save the guestId in localStorage for future use
      if (response.data.guestId) {
        localStorage.setItem("guestId", response.data.guestId);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateCheckout: (state, action) => {
      state.checkout = action.payload; // Update the checkout state
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle user checkout
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = {
          ...action.payload.checkout,
          checkoutItems: action.payload.checkout.orderItems, // Map orderItems to checkoutItems
        };
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle guest checkout
      .addCase(createGuestCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = {
          ...action.payload.checkout,
          checkoutItems: action.payload.checkout.orderItems, // Map orderItems to checkoutItems
        };
      })
      .addCase(createGuestCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateCheckout } = checkoutSlice.actions; // Export the action
export default checkoutSlice.reducer;

