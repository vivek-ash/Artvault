import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { getMe } from './features/auth/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages - Code Splitted via Lazy Loading
const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ArtworkDetail = lazy(() => import('./pages/ArtworkDetail'));
const ArtistProfile = lazy(() => import('./pages/ArtistProfile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Cart = lazy(() => import('./pages/Cart'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { MouseTrailer, GlowingBackdrop } from './components/ui';

// Auth initializer — restores session from token
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('artvault_token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return children;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthInitializer>
            <MouseTrailer />
            <GlowingBackdrop />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
              }}
            />

            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="artwork/:id" element={<ArtworkDetail />} />
                    <Route path="artist/:id" element={<ArtistProfile />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="cart" element={<Cart />} />

                    {/* Protected routes — any authenticated user */}
                    <Route path="profile" element={
                      <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="notifications" element={
                      <ProtectedRoute><Notifications /></ProtectedRoute>
                    } />

                    {/* Artist dashboard */}
                    <Route path="dashboard/artist" element={
                      <ProtectedRoute roles={['artist']}><ArtistDashboard /></ProtectedRoute>
                    } />

                    <Route path="dashboard/buyer" element={
                      <ProtectedRoute roles={['buyer', 'artist']}><BuyerDashboard /></ProtectedRoute>
                    } />

                    {/* Admin dashboard */}
                    <Route path="admin" element={
                      <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </AnimatePresence>
          </AuthInitializer>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
