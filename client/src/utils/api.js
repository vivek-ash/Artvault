import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';

    // If 401 unauthorized, could dispatch logout action
    if (error.response?.status === 401) {
      // Will be handled by components
    }

    return Promise.reject(error);
  }
);

export default api;
