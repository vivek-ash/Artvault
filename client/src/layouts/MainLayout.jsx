import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiSun, HiMoon } from 'react-icons/hi';
import {
  HiShoppingBag,
  HiUser,
  HiArrowRightOnRectangle,
  HiPaintBrush,
  HiCloudArrowUp,
  HiShieldCheck,
  HiChartBar,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../features/auth/authSlice';

const publicNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/marketplace', label: 'Marketplace' },
];

const MainLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Build nav links based on role
  const getNavLinks = () => {
    const links = [...publicNavLinks];
    if (isAuthenticated && user) {
      if (user.role === 'artist') {
        links.push({ path: '/dashboard/artist', label: 'Studio' });
      } else if (user.role === 'buyer') {
        links.push({ path: '/dashboard/buyer', label: 'My Orders' });
      } else if (user.role === 'admin') {
        links.push({ path: '/admin', label: 'Admin' });
      }
    }
    return links;
  };

  const navLinks = getNavLinks();

  // Dropdown menu items
  const getDropdownItems = () => {
    const items = [{ path: '/profile', label: 'My Profile', icon: HiUser }];
    if (user?.role === 'artist') {
      items.push(
        { path: '/dashboard/artist', label: 'Artist Studio', icon: HiPaintBrush },
        { path: '/dashboard/artist', label: 'Upload Artwork', icon: HiCloudArrowUp }
      );
    } else if (user?.role === 'buyer') {
      items.push(
        { path: '/dashboard/buyer', label: 'My Collection', icon: HiShoppingBag },
        { path: '/dashboard/buyer', label: 'Analytics', icon: HiChartBar }
      );
    } else if (user?.role === 'admin') {
      items.push({ path: '/admin', label: 'Admin Panel', icon: HiShieldCheck });
    }
    return items;
  };

  const roleBadgeColor = {
    artist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    buyer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          isDark
            ? 'bg-gallery-dark/80 border-gallery-darkBorder'
            : 'bg-gallery-light/80 border-gallery-lightBorder'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center shadow-lg shadow-gallery-accent/20 group-hover:shadow-gallery-accent/40 transition-shadow duration-300">
              <span className="text-gallery-dark font-display font-bold text-lg">A</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              <span className="text-gallery-accent">Art</span>
              <span className={isDark ? 'text-gallery-text' : 'text-gallery-textDark'}>Vault</span>
            </span>
          </Link>

          {/* Center Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path + link.label}
                  to={link.path}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-gallery-accent'
                      : isDark
                        ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                        : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gallery-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isDark
                  ? 'text-gallery-textMuted hover:text-gallery-accent hover:bg-white/5'
                  : 'text-gallery-textDarkMuted hover:text-gallery-accent hover:bg-black/5'
              }`}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiSun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiMoon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isDark
                  ? 'text-gallery-textMuted hover:text-gallery-accent hover:bg-white/5'
                  : 'text-gallery-textDarkMuted hover:text-gallery-accent hover:bg-black/5'
              }`}
            >
              <HiShoppingBag className="w-5 h-5" />
            </Link>

            {/* Auth Section — Desktop */}
            <div className="hidden sm:flex items-center gap-2 ml-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isDark
                        ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                        : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gallery-accent text-gallery-dark px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gallery-accentHover transition-all duration-300 shadow-lg shadow-gallery-accent/20 hover:shadow-gallery-accent/30"
                  >
                    Join Now
                  </Link>
                </>
              ) : (
                /* User Avatar Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gallery-accent/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center text-gallery-dark text-xs font-bold">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <span
                      className={`text-sm font-medium hidden lg:block ${
                        isDark ? 'text-gallery-text' : 'text-gallery-textDark'
                      }`}
                    >
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-64 rounded-xl overflow-hidden shadow-2xl border z-50 ${
                          isDark
                            ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-black/40'
                            : 'bg-gallery-lightCard border-gallery-lightBorder shadow-black/10'
                        }`}
                      >
                        {/* User Info Header */}
                        <div
                          className={`px-4 py-4 border-b ${
                            isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'
                          }`}
                        >
                          <p
                            className={`font-semibold text-sm ${
                              isDark ? 'text-gallery-text' : 'text-gallery-textDark'
                            }`}
                          >
                            {user?.name}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'
                            }`}
                          >
                            {user?.email}
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                              roleBadgeColor[user?.role] || ''
                            }`}
                          >
                            {user?.role}
                          </span>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {getDropdownItems().map((item) => (
                            <Link
                              key={item.label}
                              to={item.path}
                              onClick={() => setIsDropdownOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 ${
                                isDark
                                  ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                                  : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div
                          className={`py-1 border-t ${
                            isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'
                          }`}
                        >
                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-200 text-red-400 hover:bg-red-500/10`}
                          >
                            <HiArrowRightOnRectangle className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
                isDark
                  ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                  : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
              }`}
            >
              {isMobileMenuOpen ? (
                <HiXMark className="w-6 h-6" />
              ) : (
                <HiBars3 className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden overflow-hidden border-t ${
                isDark ? 'border-gallery-darkBorder bg-gallery-dark' : 'border-gallery-lightBorder bg-gallery-light'
              }`}
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path + link.label}
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-gallery-accent bg-gallery-accent/10'
                          : isDark
                            ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                            : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Auth */}
                <div className={`pt-3 mt-3 border-t ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <Link to="/login" className="block w-full text-center btn-secondary py-3 rounded-lg text-sm">
                        Sign In
                      </Link>
                      <Link to="/register" className="block w-full text-center btn-primary py-3 rounded-lg text-sm">
                        Join Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-4 py-2 mb-2">
                        <p className={`font-semibold text-sm ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                          {user?.name}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${roleBadgeColor[user?.role] || ''}`}>
                          {user?.role}
                        </span>
                      </div>
                      {getDropdownItems().map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                            isDark
                              ? 'text-gallery-textMuted hover:text-gallery-text hover:bg-white/5'
                              : 'text-gallery-textDarkMuted hover:text-gallery-textDark hover:bg-black/5'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        <HiArrowRightOnRectangle className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={`border-t transition-colors duration-300 ${
          isDark ? 'border-gallery-darkBorder bg-gallery-dark' : 'border-gallery-lightBorder bg-gallery-light'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center">
                  <span className="text-gallery-dark font-display font-bold text-sm">A</span>
                </div>
                <span className="font-display text-xl font-bold">
                  <span className="text-gallery-accent">Art</span>
                  <span className={isDark ? 'text-gallery-text' : 'text-gallery-textDark'}>Vault</span>
                </span>
              </Link>
              <p className={`text-sm max-w-md leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                A curated marketplace where artists showcase and sell their finest digital creations.
                Discover, collect, and own extraordinary digital art.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`font-display font-semibold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Explore
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Marketplace', path: '/marketplace' },
                  { label: 'Artists', path: '/marketplace' },
                  { label: 'Collections', path: '/marketplace' },
                  { label: 'Auctions', path: '/marketplace' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`text-sm transition-colors duration-200 hover:text-gallery-accent ${
                        isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className={`font-display font-semibold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Support
              </h4>
              <ul className="space-y-2.5">
                {['Help Center', 'Terms of Service', 'Privacy Policy', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <span className={`text-sm cursor-pointer transition-colors duration-200 hover:text-gallery-accent ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
            <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              © {new Date().getFullYear()} ArtVault. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'Instagram', 'Discord'].map((social) => (
                <span
                  key={social}
                  className={`text-xs cursor-pointer transition-colors duration-200 hover:text-gallery-accent ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
