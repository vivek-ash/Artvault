import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token for cross-domain auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('artvault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';

    // If 401 unauthorized, clear stored token and redirect to login
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('artvault_token');
      localStorage.removeItem('artvault_token');

      // Only show session expired if user was previously logged in
      if (hadToken && !window.location.pathname.includes('/login')) {
        // Dynamic import to avoid circular dependency
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Session expired. Please sign in again.');
        });
        // Redirect to login after a small delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
