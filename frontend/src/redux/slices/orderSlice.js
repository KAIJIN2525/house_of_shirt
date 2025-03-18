import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch user orders
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAllOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const isLoggedIn = !!state.auth.user; // Check if the user is logged in
      const guestId = localStorage.getItem("guestId"); // Get guestId from localStorage
      const token = localStorage.getItem("userToken"); // Get token from localStorage

      const url = isLoggedIn
        ? `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`
        : `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders/guest`;

      const headers = isLoggedIn
        ? { Authorization: `Bearer ${token}` } // Use token from localStorage
        : { "guest-id": guestId };

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch order details by ID
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const isLoggedIn = !!state.auth.user; // Check if the user is logged in
      const guestId = localStorage.getItem("guestId"); // Get guestId from localStorage
      const token = localStorage.getItem("userToken"); // Get token from localStorage

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`;

      const headers = isLoggedIn
        ? { Authorization: `Bearer ${token}` } // Use token from localStorage
        : { "guest-id": guestId };
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to associate guest orders with a new user account
export const associateGuestOrders = createAsyncThunk(
  "orders/associateGuestOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user._id; // Logged-in user's ID
      const guestId = localStorage.getItem("guestId"); // Get guestId from localStorage
      const token = localStorage.getItem("userToken"); // Get token from localStorage

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/associate`,
        { userId, guestId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use token from localStorage
          },
        }
      );

      // Clear guestId from localStorage after association
      localStorage.removeItem("guestId");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [], // List all orders
    totalOrders: 0,
    orderDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      // Associate guest orders
      .addCase(associateGuestOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(associateGuestOrders.fulfilled, (state) => {
        state.loading = false;
        state.orders = []; // Clear guest orders after association
      })
      .addCase(associateGuestOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
