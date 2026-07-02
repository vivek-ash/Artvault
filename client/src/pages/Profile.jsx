import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiUser,
  HiCamera,
  HiGlobeAlt,
  HiPencilSquare,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, clearError } from '../features/auth/authSlice';

const Profile = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    website: '',
    twitter: '',
    instagram: '',
    behance: '',
  });

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSocialLinks({
        website: user.socialLinks?.website || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
        behance: user.socialLinks?.behance || '',
      });
    }
  }, [user]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSocialChange = (field, value) => {
    setSocialLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    const result = await dispatch(
      updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        socialLinks,
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    }
  };

  // Generate initials for avatar placeholder
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const socialFields = [
    { key: 'website', label: 'Website', placeholder: 'https://yoursite.com', icon: '🌐' },
    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', icon: '𝕏' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle', icon: '📸' },
    { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/yourprofile', icon: '🎨' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center px-6 py-12"
    >
      <div className={`w-full max-w-2xl p-8 sm:p-10 rounded-2xl border ${
        isDark
          ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-2xl shadow-black/40'
          : 'bg-gallery-lightCard border-gallery-lightBorder shadow-2xl shadow-black/10'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <HiPencilSquare className="w-6 h-6 text-gallery-accent" />
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-display font-bold border-2 transition-all duration-300 ${
                isDark
                  ? 'bg-gallery-darkSurface border-gallery-darkBorder text-gallery-textMuted'
                  : 'bg-gallery-lightSurface border-gallery-lightBorder text-gallery-textDarkMuted'
              }`}>
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <HiCamera className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className={`text-xs mt-3 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Photo upload available soon
            </p>
          </div>

          <div className="space-y-5">
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

            {/* Email (read-only) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input-field opacity-60 cursor-not-allowed"
                />
              </div>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-gallery-textMuted/60' : 'text-gallery-textDarkMuted/60'}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Role badge */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Role
              </label>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gallery-accent/15 text-gallery-accent text-sm font-medium capitalize">
                {user?.role || 'User'}
              </span>
            </div>

            {/* Bio */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself, your art style, or what inspires you..."
                rows={4}
                className="input-field resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Social Links */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HiGlobeAlt className="w-5 h-5 text-gallery-accent" />
                <label className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                  Social Links
                </label>
              </div>
              <div className="space-y-3">
                {socialFields.map((field) => (
                  <div key={field.key}>
                    <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                      {field.icon} {field.label}
                    </label>
                    <input
                      type="url"
                      value={socialLinks[field.key]}
                      onChange={(e) => handleSocialChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-field text-sm"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 rounded-xl text-base mt-8 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gallery-dark/30 border-t-gallery-dark rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Profile;
