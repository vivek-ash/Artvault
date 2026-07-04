import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiPaintBrush,
  HiShoppingBag,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { registerUser, clearError } from '../features/auth/authSlice';
import { PageTransition } from '../components/ui';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

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
    setValidationError('');

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    dispatch(registerUser({ name, email, password, role }));
  };

  const mutedText = isDark
    ? 'text-gallery-darkTextMuted'
    : 'text-gallery-textMuted';

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-lg card p-8">
          {/* Terracotta accent bar */}
          <div className="h-1 w-16 bg-brand-terracotta rounded-full mx-auto mb-6" />

          {/* Heading */}
          <h1 className="font-display text-2xl text-center mb-2">
            Create Your Account
          </h1>

          {/* Subtitle */}
          <p className={`text-sm text-center mb-8 ${mutedText}`}>
            Join the world&apos;s premier digital art marketplace
          </p>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Artist card */}
            <button
              type="button"
              onClick={() => setRole('artist')}
              className={`p-4 rounded-xl border cursor-pointer transition-all text-left ${
                role === 'artist'
                  ? 'border-2 border-brand-terracotta bg-brand-terracotta/5'
                  : isDark
                  ? 'border-gallery-darkCard hover:border-brand-terracotta/40'
                  : 'border-gallery-card hover:border-brand-terracotta/40'
              }`}
            >
              <HiPaintBrush
                className={`w-6 h-6 mb-2 ${
                  role === 'artist' ? 'text-brand-terracotta' : mutedText
                }`}
              />
              <p className="font-medium text-sm">I&apos;m an Artist</p>
              <p className={`text-xs mt-1 ${mutedText}`}>
                Showcase &amp; sell your art
              </p>
            </button>

            {/* Collector card */}
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-xl border cursor-pointer transition-all text-left ${
                role === 'buyer'
                  ? 'border-2 border-brand-teal bg-brand-teal/5'
                  : isDark
                  ? 'border-gallery-darkCard hover:border-brand-teal/40'
                  : 'border-gallery-card hover:border-brand-teal/40'
              }`}
            >
              <HiShoppingBag
                className={`w-6 h-6 mb-2 ${
                  role === 'buyer' ? 'text-brand-teal' : mutedText
                }`}
              />
              <p className="font-medium text-sm">I&apos;m a Collector</p>
              <p className={`text-xs mt-1 ${mutedText}`}>
                Discover &amp; collect art
              </p>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="relative">
              <HiUser
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedText}`}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field w-full pl-10"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <HiEnvelope
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedText}`}
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

            {/* Password */}
            <div>
              <div className="relative">
                <HiLockClosed
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedText}`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationError('');
                  }}
                  required
                  className="input-field w-full pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-brand-terracotta transition-colors`}
                >
                  {showPassword ? (
                    <HiEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <HiLockClosed
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedText}`}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setValidationError('');
                  }}
                  required
                  className="input-field w-full pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-brand-terracotta transition-colors`}
                >
                  {showConfirmPassword ? (
                    <HiEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Validation error */}
              {validationError && (
                <p className="text-red-500 text-xs mt-2">{validationError}</p>
              )}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className={`text-sm text-center mt-6 ${mutedText}`}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-terracotta hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </PageTransition>
  );
};

export default Register;
