import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiUser, HiEnvelope, HiLockClosed, HiPaintBrush, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { HiShoppingBag } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { registerUser, clearError } from '../features/auth/authSlice';

const Register = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { value: 'artist', label: "I'm an Artist", icon: HiPaintBrush, desc: 'Showcase & sell your art' },
    { value: 'buyer', label: "I'm a Buyer", icon: HiShoppingBag, desc: 'Discover & collect art' },
  ];

  // Redirect on successful registration
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap = {
        artist: '/dashboard/artist',
        buyer: '/dashboard/buyer',
        admin: '/admin',
      };
      toast.success(`Welcome to ArtVault, ${user.name}!`);
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

    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    dispatch(registerUser({ name: name.trim(), email, password, role }));
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
            Join ArtVault
          </h1>
          <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
            Create your account and start your journey
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    role === r.value
                      ? 'border-gallery-accent bg-gallery-accent/10'
                      : isDark
                        ? 'border-gallery-darkBorder hover:border-gallery-accent/30 bg-gallery-darkSurface'
                        : 'border-gallery-lightBorder hover:border-gallery-accent/30 bg-gallery-lightSurface'
                  }`}
                >
                  <r.icon className={`w-6 h-6 mb-2 ${role === r.value ? 'text-gallery-accent' : isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`} />
                  <p className={`text-sm font-semibold ${
                    role === r.value
                      ? 'text-gallery-accent'
                      : isDark ? 'text-gallery-text' : 'text-gallery-textDark'
                  }`}>
                    {r.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                    {r.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Full Name
            </label>
            <div className="relative">
              <HiUser className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-textMuted/50' : 'text-gallery-textDarkMuted/50'}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="input-field pl-12"
                disabled={isLoading}
              />
            </div>
          </div>

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
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Password
            </label>
            <div className="relative">
              <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-textMuted/50' : 'text-gallery-textDarkMuted/50'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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
            <p className={`text-xs mt-1.5 ${isDark ? 'text-gallery-textMuted/60' : 'text-gallery-textDarkMuted/60'}`}>
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Confirm Password
            </label>
            <div className="relative">
              <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-textMuted/50' : 'text-gallery-textDarkMuted/50'}`} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="input-field pl-12 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  isDark
                    ? 'text-gallery-textMuted/50 hover:text-gallery-textMuted'
                    : 'text-gallery-textDarkMuted/50 hover:text-gallery-textDarkMuted'
                }`}
                tabIndex={-1}
              >
                {showConfirmPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className={`flex-1 h-px ${isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-lightBorder'}`} />
          <span className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>or</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-lightBorder'}`} />
        </div>

        {/* Login Link */}
        <p className={`text-center text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-gallery-accent hover:text-gallery-accentHover font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
