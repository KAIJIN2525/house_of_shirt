import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createGuestCheckout = createAsyncThunk(
  "checkout/createGuestCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/guest`,
        checkoutData
      );
      if (response.data.guestId) {
        localStorage.setItem("guestId", response.data.guestId);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const confirmBankPayment = createAsyncThunk(
  "checkout/confirmBankPayment",
  async (checkoutId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/checkout/${checkoutId}/confirm-bank`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "checkout/updatePaymentStatus",
  async ({ checkoutId, status, paymentDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/checkout/${checkoutId}/payment`,
        { status, paymentDetails },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const finalizeCheckout = createAsyncThunk(
  "checkout/finalizeCheckout",
  async (checkoutId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyPaystackPayment = createAsyncThunk(
  "checkout/verifyPaystack",
  async ({ reference, checkoutId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/verify-paystack`,
        { reference, checkoutId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  checkout: null,
  loading: false,
  error: null,
  paymentStatus: "pending", // 'pending' | 'unconfirmed' | 'success' | 'failed'
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.checkout = null;
      state.loading = false;
      state.error = null;
      state.paymentStatus = "pending";
    },
    setCheckout: (state, action) => {
      state.checkout = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Checkout
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload.checkout;
        state.paymentStatus = action.payload.checkout.paymentStatus;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Guest Checkout
      .addCase(createGuestCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload.checkout;
        state.paymentStatus = action.payload.checkout.paymentStatus;
      })
      .addCase(createGuestCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Confirm Bank Payment
      .addCase(confirmBankPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmBankPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload.checkout;
        state.paymentStatus = "unconfirmed";
      })
      .addCase(confirmBankPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Update Payment Status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload.checkout;
        state.paymentStatus = action.payload.checkout.paymentStatus;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Finalize Checkout
      .addCase(finalizeCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finalizeCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload; // Backend returns order directly
        state.paymentStatus = action.payload.paymentStatus;
      })
      .addCase(finalizeCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
      })

      // Verify Paystack Payment
      .addCase(verifyPaystackPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPaystackPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload.checkout;
        state.paymentStatus = "success";
      })
      .addCase(verifyPaystackPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error.message;
        state.paymentStatus = "failed";
      });
  },
});

export const { resetCheckout, setCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
