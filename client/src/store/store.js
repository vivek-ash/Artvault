import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import artworkReducer from '../features/artwork/artworkSlice';
import orderReducer from '../features/order/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artwork: artworkReducer,
    order: orderReducer,
  },
});
