import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { loginUser, loginWithFirebase, clearError } from '../features/auth/authSlice';
import { PageTransition, Modal } from '../components/ui';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      // 1. Try traditional local DB login first (for existing users)
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success('Logged in successfully!');
    } catch (err) {
      console.warn('Local DB login failed, attempting Firebase fallback authentication:', err);

      setFirebaseLoading(true);
      try {
        // Check if user is registered in MongoDB before attempting Firebase
        const { data } = await api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        
        if (!data.exists) {
          toast.error('User not found. Please register first.');
          setFirebaseLoading(false);
          return;
        }

        if (data.exists && !data.existsInFirebase) {
          toast.error('Account registration incomplete. Please register again to re-link your profile.');
          setFirebaseLoading(false);
          return;
        }

        // 2. Fallback to Firebase Authentication
        if (!auth) {
          toast.error(`Local login failed: ${err.message || 'Invalid credentials'}. (Firebase client config not set).`);
          setFirebaseLoading(false);
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Check if email is verified
        if (!firebaseUser.emailVerified) {
          toast.error('Please verify your email address first.');
          await auth.signOut();
          setFirebaseLoading(false);
          return;
        }

        // Get ID Token
        const idToken = await firebaseUser.getIdToken();

        // Log in to our backend using Firebase credentials
        await dispatch(loginWithFirebase({ idToken })).unwrap();
        toast.success('Logged in successfully!');
      } catch (firebaseErr) {
        console.error(firebaseErr);
        let msg = 'Invalid credentials';
        if (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (firebaseErr.code === 'auth/user-disabled') {
          msg = 'This account has been disabled.';
        } else {
          msg = firebaseErr.message || msg;
        }
        toast.error(msg);
      } finally {
        setFirebaseLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!auth) {
      toast.error('Firebase Auth is not configured. Cannot send password reset email.');
      setForgotLoading(false);
      return;
    }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success('Password reset link sent! Please check your email inbox.');
      setForgotModalOpen(false);
      setForgotEmail('');
    } catch (err) {
      console.error(err);
      let msg = err.message || 'Failed to send password reset email';
      if (err.code === 'auth/user-not-found') {
        msg = 'No user found with this email address.';
      }
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
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

            {/* Forgot Password Link */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-brand-terracotta hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || firebaseLoading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {(isLoading || firebaseLoading) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {(isLoading || firebaseLoading) ? 'Signing in...' : 'Sign In'}
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

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setForgotEmail('');
        }}
        title="Reset Password"
        size="md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4 p-1">
          <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            Enter your email address and we'll send you a link to reset your password via Firebase.
          </p>
          <div className="relative">
            <HiEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`} />
            <input
              type="email"
              placeholder="Email address"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="input-field w-full pl-9 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setForgotEmail('');
              }}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={forgotLoading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {forgotLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default Login;
