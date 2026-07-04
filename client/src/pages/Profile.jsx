import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiCamera, HiGlobeAlt } from 'react-icons/hi2';
import { FaTwitter, FaInstagram, FaBehance } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { updateProfile } from '../features/auth/authSlice';
import { PageTransition, Avatar, Badge } from '../components/ui';

const Profile = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', bio: '', website: '', twitter: '', instagram: '', behance: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        website: user.socialLinks?.website || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
        behance: user.socialLinks?.behance || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({
        name: form.name,
        bio: form.bio,
        socialLinks: { website: form.website, twitter: form.twitter, instagram: form.instagram, behance: form.behance },
      })).unwrap();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err || 'Update failed'); }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-title mb-8">Edit Profile</h1>

        <div className="card p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative group cursor-pointer">
              <Avatar name={user?.name} image={user?.profileImage} size="xl" />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <HiCamera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className={`text-sm ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{user?.email}</p>
              <Badge variant="auto" size="xs" className="mt-1">{user?.role}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={user?.email || ''} className="input-field opacity-60 cursor-not-allowed" disabled />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                className="input-field min-h-[100px] resize-none" maxLength={500} placeholder="Tell us about yourself..." />
              <p className={`text-xs mt-1 text-right ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                {form.bio.length}/500
              </p>
            </div>

            <div className={`border-t pt-5 ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'}`}>
              <h3 className="font-display font-semibold mb-4">Social Links</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <HiGlobeAlt className="w-5 h-5 text-brand-teal flex-shrink-0" />
                  <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://yourwebsite.com" />
                </div>
                <div className="flex items-center gap-3">
                  <FaTwitter className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} className="input-field" placeholder="username" />
                </div>
                <div className="flex items-center gap-3">
                  <FaInstagram className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} className="input-field" placeholder="username" />
                </div>
                <div className="flex items-center gap-3">
                  <FaBehance className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <input value={form.behance} onChange={e => setForm({ ...form, behance: e.target.value })} className="input-field" placeholder="username" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
