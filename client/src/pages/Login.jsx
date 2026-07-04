import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { loginUser, clearError } from '../features/auth/authSlice';
import { PageTransition } from '../components/ui';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      switch (user.role) {
        case 'artist':
          navigate('/dashboard/artist');
          break;
        case 'buyer':
          navigate('/dashboard/buyer');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md card p-8">
          {/* Terracotta accent bar */}
          <div className="h-1 w-16 bg-brand-terracotta rounded-full mx-auto mb-6" />

          {/* Heading */}
          <h1 className="font-display text-2xl text-center mb-2">
            Welcome Back
          </h1>

          {/* Subtitle */}
          <p
            className={`text-sm text-center mb-8 ${
              isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
            }`}
          >
            Sign in to your ArtVault account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="relative">
              <HiEnvelope
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                }`}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full pl-10"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <HiLockClosed
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                } hover:text-brand-terracotta transition-colors`}
              >
                {showPassword ? (
                  <HiEyeSlash className="w-5 h-5" />
                ) : (
                  <HiEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p
            className={`text-sm text-center mt-6 ${
              isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
            }`}
          >
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-brand-terracotta hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </PageTransition>
  );
};

export default Login;
