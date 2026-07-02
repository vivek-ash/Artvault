import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch user's wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/wishlist');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch wishlist');
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (artworkId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/wishlist/${artworkId}`);
      return { artworkId, data: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to add to wishlist');
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (artworkId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/wishlist/${artworkId}`);
      return artworkId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to remove from wishlist');
    }
  }
);

// Check if artwork is wishlisted
export const checkWishlist = createAsyncThunk(
  'wishlist/check',
  async (artworkId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/wishlist/check/${artworkId}`);
      return { artworkId, isWishlisted: res.data.isWishlisted };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to check wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    wishlistedIds: {}, // { artworkId: true/false } for quick lookup
    isLoading: false,
    error: null,
  },
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        // Build lookup map
        state.wishlistedIds = {};
        action.payload.forEach((item) => {
          if (item.artwork?._id) {
            state.wishlistedIds[item.artwork._id] = true;
          }
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistedIds[action.payload.artworkId] = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistedIds[action.payload] = false;
        state.items = state.items.filter(
          (item) => item.artwork?._id !== action.payload
        );
      })
      .addCase(checkWishlist.fulfilled, (state, action) => {
        state.wishlistedIds[action.payload.artworkId] = action.payload.isWishlisted;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
