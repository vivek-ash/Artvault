import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/notifications?limit=50');
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notification/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/api/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/api/notifications/read-all');
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      // Prevent duplicates if already present
      if (!state.notifications.some(n => n._id === action.payload._id)) {
        state.notifications.unshift(action.payload);
      }
    },
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload);
        if (index !== -1) {
          state.notifications[index].isRead = true;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.isRead = true;
        });
      });
  }
});

export const { addNotification, clearNotificationsState } = notificationSlice.actions;
export default notificationSlice.reducer;
