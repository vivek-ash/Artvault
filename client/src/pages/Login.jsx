import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { loginUser, clearError } from '../features/auth/authSlice';

const Login = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap = {
        artist: '/dashboard/artist',
        buyer: '/dashboard/buyer',
        admin: '/admin',
      };
      toast.success(`Welcome back, ${user.name}!`);
      navigate(redirectMap[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center px-6 py-12"
    >
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-2xl border ${
        isDark
          ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-2xl shadow-black/40'
          : 'bg-gallery-lightCard border-gallery-lightBorder shadow-2xl shadow-black/10'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center shadow-lg shadow-gallery-accent/20">
            <span className="text-gallery-dark font-display font-bold text-xl">A</span>
          </div>
          <h1 className={`font-display text-3xl font-bold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            Welcome Back
          </h1>
          <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
            Sign in to your ArtVault account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Email
            </label>
            <div className="relative">
              <HiEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-textMuted/50' : 'text-gallery-textDarkMuted/50'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-12"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Password
              </label>
              <span className="text-xs text-gallery-accent cursor-pointer hover:text-gallery-accentHover transition-colors">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-textMuted/50' : 'text-gallery-textDarkMuted/50'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-12 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  isDark
                    ? 'text-gallery-textMuted/50 hover:text-gallery-textMuted'
                    : 'text-gallery-textDarkMuted/50 hover:text-gallery-textDarkMuted'
                }`}
                tabIndex={-1}
              >
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 rounded-xl text-base mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gallery-dark/30 border-t-gallery-dark rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className={`flex-1 h-px ${isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-lightBorder'}`} />
          <span className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>or</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-lightBorder'}`} />
        </div>

        {/* Register Link */}
        <p className={`text-center text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-gallery-accent hover:text-gallery-accentHover font-medium transition-colors">
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
