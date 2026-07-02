import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Create order + Razorpay checkout
export const createOrder = createAsyncThunk(
  'order/create',
  async (artworkId, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/orders', { artworkId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create order');
    }
  }
);

// Verify payment after Razorpay callback
export const verifyPayment = createAsyncThunk(
  'order/verify',
  async ({ orderId, razorpayPaymentId, razorpaySignature }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/orders/${orderId}/verify`, {
        razorpayPaymentId,
        razorpaySignature,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Payment verification failed');
    }
  }
);

// Fetch my orders
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMy',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/api/orders/my-orders?${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

// Get download link
export const getDownloadLink = createAsyncThunk(
  'order/download',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/orders/${orderId}/download`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Download failed');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    pagination: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentOrder = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })
      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
