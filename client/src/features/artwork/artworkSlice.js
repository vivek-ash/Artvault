import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchArtworks = createAsyncThunk(
  'artwork/fetchArtworks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/artworks', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch artworks');
    }
  }
);

export const fetchArtwork = createAsyncThunk(
  'artwork/fetchArtwork',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/artworks/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch artwork');
    }
  }
);

export const fetchMyArtworks = createAsyncThunk(
  'artwork/fetchMyArtworks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/artworks/my-artworks', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your artworks');
    }
  }
);

export const createArtwork = createAsyncThunk(
  'artwork/createArtwork',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/artworks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create artwork');
    }
  }
);

export const updateArtwork = createAsyncThunk(
  'artwork/updateArtwork',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/artworks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update artwork');
    }
  }
);

export const deleteArtwork = createAsyncThunk(
  'artwork/deleteArtwork',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/artworks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete artwork');
    }
  }
);

export const fetchRelatedArtworks = createAsyncThunk(
  'artwork/fetchRelatedArtworks',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/artworks/${id}/related`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch related artworks');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  artworks: [],
  myArtworks: [],
  currentArtwork: null,
  relatedArtworks: [],
  pagination: null,
  isLoading: false,
  isUploading: false,
  error: null,
  filters: {
    category: '',
    style: '',
    minPrice: '',
    maxPrice: '',
    color: '',
    saleType: '',
    search: '',
    sort: '-createdAt',
  },
};

const artworkSlice = createSlice({
  name: 'artwork',
  initialState,
  reducers: {
    clearCurrentArtwork: (state) => {
      state.currentArtwork = null;
      state.relatedArtworks = [];
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearArtworkError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All (marketplace) ──────────────────────────────────────
      .addCase(fetchArtworks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.artworks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Fetch Single ─────────────────────────────────────────────────
      .addCase(fetchArtwork.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArtwork.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentArtwork = action.payload;
      })
      .addCase(fetchArtwork.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Fetch My Artworks ────────────────────────────────────────────
      .addCase(fetchMyArtworks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyArtworks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myArtworks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyArtworks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Create ───────────────────────────────────────────────────────
      .addCase(createArtwork.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createArtwork.fulfilled, (state, action) => {
        state.isUploading = false;
        state.myArtworks.unshift(action.payload);
      })
      .addCase(createArtwork.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      // ── Update ───────────────────────────────────────────────────────
      .addCase(updateArtwork.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(updateArtwork.fulfilled, (state, action) => {
        state.isUploading = false;
        const idx = state.myArtworks.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.myArtworks[idx] = action.payload;
        if (state.currentArtwork?._id === action.payload._id) {
          state.currentArtwork = action.payload;
        }
      })
      .addCase(updateArtwork.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      // ── Delete ───────────────────────────────────────────────────────
      .addCase(deleteArtwork.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteArtwork.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myArtworks = state.myArtworks.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteArtwork.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Related ──────────────────────────────────────────────────────
      .addCase(fetchRelatedArtworks.fulfilled, (state, action) => {
        state.relatedArtworks = action.payload;
      });
  },
});

export const { clearCurrentArtwork, setFilters, clearFilters, clearArtworkError } =
  artworkSlice.actions;
export default artworkSlice.reducer;
