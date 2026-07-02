import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password, role });
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Registration failed'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Logout failed'
      );
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Session expired'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, bio, socialLinks }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/api/auth/profile', { name, bio, socialLinks });
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Profile update failed'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ────────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Login ───────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Logout ──────────────────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Get Me (session restore) ────────────────────────────────────────
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Don't set error for getMe rejection — it just means no session
      })
      // ── Update Profile ──────────────────────────────────────────────────
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
