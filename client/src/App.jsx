import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { getMe } from './features/auth/authSlice';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ArtworkDetail from './pages/ArtworkDetail';
import ArtistProfile from './pages/ArtistProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtistDashboard from './pages/ArtistDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Auth initializer — checks for existing session on app load
function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AuthInitializer>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#242424',
                  color: '#faf8f5',
                  border: '1px solid #2e2e2e',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* Public routes */}
                <Route index element={<Home />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="artwork/:id" element={<ArtworkDetail />} />
                <Route path="artist/:id" element={<ArtistProfile />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="cart" element={<Cart />} />

                {/* Protected routes — any authenticated user */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Artist-only routes */}
                <Route
                  path="dashboard/artist"
                  element={
                    <ProtectedRoute roles={['artist']}>
                      <ArtistDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Buyer-only routes */}
                <Route
                  path="dashboard/buyer"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-only routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthInitializer>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
