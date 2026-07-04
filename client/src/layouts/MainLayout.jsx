import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSun, HiMoon, HiBars3, HiXMark, HiBell,
  HiArrowRightOnRectangle, HiUser, HiPaintBrush,
  HiShoppingBag, HiCog6Tooth, HiHeart, HiChartBar,
  HiPhoto, HiUserGroup, HiInbox, HiHome, HiBuildingStorefront,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../features/auth/authSlice';
import { fetchNotifications } from '../features/notification/notificationSlice';
import useSocket from '../hooks/useSocket';
import { Avatar } from '../components/ui';

const MainLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const { notifications } = useSelector((state) => state.notification);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize socket connection
  useSocket();

  // Fetch notifications on mount / auth change
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Scroll detection for navbar bg
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
    setDropdownOpen(false);
  };

  const publicLinks = [
    { label: 'Home', to: '/', icon: HiHome },
    { label: 'Marketplace', to: '/marketplace', icon: HiBuildingStorefront },
  ];

  const roleLinks = {
    artist: [
      { label: 'My Studio', to: '/dashboard/artist', icon: HiPaintBrush },
      { label: 'My Collection', to: '/dashboard/buyer', icon: HiShoppingBag },
    ],
    buyer: [
      { label: 'My Collection', to: '/dashboard/buyer', icon: HiShoppingBag },
    ],
    admin: [
      { label: 'Admin', to: '/admin', icon: HiCog6Tooth },
    ],
  };

  const navLinks = [
    ...publicLinks,
    ...(isAuthenticated && user?.role ? (roleLinks[user.role] || []) : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? 'bg-gallery-darkBg/90 backdrop-blur-xl border-b border-gallery-darkBorder shadow-dark-card'
              : 'bg-gallery-bg/90 backdrop-blur-xl border-b border-gallery-border shadow-card'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #c45d3e 0%, #e8856c 100%)' }}>
              A
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Art<span className="text-brand-terracotta">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-brand-terracotta bg-brand-terracotta/8'
                    : isDark
                      ? 'text-gallery-darkTextSecondary hover:text-gallery-darkText hover:bg-white/5'
                      : 'text-gallery-textSecondary hover:text-gallery-text hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDark ? 'hover:bg-white/10 text-gallery-darkTextMuted' : 'hover:bg-black/5 text-gallery-textMuted'
              }`}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'moon' : 'sun'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <Link
                  to="/notifications"
                  className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                    isDark ? 'hover:bg-white/10 text-gallery-darkTextMuted' : 'hover:bg-black/5 text-gallery-textMuted'
                  }`}
                >
                  <HiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 hover:bg-black/5 dark-theme:hover:bg-white/5"
                  >
                    <Avatar name={user?.name} image={user?.profileImage} size="sm" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-elevated overflow-hidden ${
                          isDark
                            ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-elevated'
                            : 'bg-gallery-card border-gallery-border'
                        }`}
                      >
                        {/* User info */}
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'}`}>
                          <p className="font-semibold text-sm truncate">{user?.name}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                            {user?.email}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            user?.role === 'artist' ? 'bg-brand-terracotta/10 text-brand-terracotta'
                            : user?.role === 'admin' ? 'bg-brand-lavender/10 text-brand-lavender'
                            : 'bg-brand-teal/10 text-brand-teal'
                          }`}>
                            {user?.role}
                          </span>
                        </div>

                        {/* Menu items */}
                        <div className="py-1.5">
                          <DropdownLink icon={HiUser} label="Profile" to="/profile" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                          {user?.role === 'artist' && (
                            <>
                              <DropdownLink icon={HiPaintBrush} label="My Studio" to="/dashboard/artist" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                              <DropdownLink icon={HiShoppingBag} label="My Collection" to="/dashboard/buyer" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                              <DropdownLink icon={HiHeart} label="Wishlist" to="/dashboard/buyer?tab=wishlist" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                              <DropdownLink icon={HiChartBar} label="Analytics" to="/dashboard/artist?tab=analytics" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                            </>
                          )}
                          {user?.role === 'buyer' && (
                            <>
                              <DropdownLink icon={HiShoppingBag} label="My Collection" to="/dashboard/buyer" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                              <DropdownLink icon={HiHeart} label="Wishlist" to="/dashboard/buyer?tab=wishlist" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                            </>
                          )}
                          {user?.role === 'admin' && (
                            <DropdownLink icon={HiCog6Tooth} label="Admin Panel" to="/admin" isDark={isDark} onClick={() => setDropdownOpen(false)} />
                          )}
                        </div>

                        {/* Logout */}
                        <div className={`border-t py-1.5 ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'}`}>
                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors ${
                              isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                            }`}
                          >
                            <HiArrowRightOnRectangle className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !py-2.5">Join ArtVault</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              {mobileMenuOpen ? <HiXMark className="w-5 h-5" /> : <HiBars3 className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden border-t overflow-hidden ${
                isDark ? 'bg-gallery-darkBg border-gallery-darkBorder' : 'bg-gallery-bg border-gallery-border'
              }`}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-brand-terracotta bg-brand-terracotta/8'
                        : isDark
                          ? 'text-gallery-darkTextSecondary hover:bg-white/5'
                          : 'text-gallery-textSecondary hover:bg-black/5'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-3 space-y-2 border-t mt-2" style={{ borderColor: isDark ? '#2e2e2e' : '#e8e0d4' }}>
                    <Link to="/login" className="block text-center btn-ghost w-full">Sign In</Link>
                    <Link to="/register" className="block text-center btn-primary w-full">Join ArtVault</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className={`border-t mt-auto ${isDark ? 'bg-gallery-darkSurface border-gallery-darkBorder' : 'bg-gallery-surface border-gallery-border'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-white text-xs"
                  style={{ background: 'linear-gradient(135deg, #c45d3e 0%, #e8856c 100%)' }}>
                  A
                </div>
                <span className="font-display text-lg font-bold">
                  Art<span className="text-brand-terracotta">Vault</span>
                </span>
              </Link>
              <p className={`text-sm max-w-sm ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                A curated marketplace where artists showcase and sell their finest digital creations. Discover, collect, and own extraordinary digital art.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-display font-semibold text-sm mb-4">Explore</h4>
              <ul className="space-y-2.5">
                {['Marketplace', 'Categories', 'Trending', 'New Arrivals'].map((item) => (
                  <li key={item}>
                    <Link to="/marketplace" className={`text-sm transition-colors hover:text-brand-terracotta ${
                      isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                    }`}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display font-semibold text-sm mb-4">Support</h4>
              <ul className="space-y-2.5">
                {['Help Center', 'Terms of Service', 'Privacy Policy', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <span className={`text-sm ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'
          }`}>
            <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
              © {new Date().getFullYear()} ArtVault. All rights reserved.
            </p>
            <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
              Made with ❤️ for digital artists everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Dropdown menu item
const DropdownLink = ({ icon: Icon, label, to, isDark, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
      isDark
        ? 'text-gallery-darkTextSecondary hover:text-gallery-darkText hover:bg-white/5'
        : 'text-gallery-textSecondary hover:text-gallery-text hover:bg-black/5'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </Link>
);

export default MainLayout;
