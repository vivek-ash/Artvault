import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiGlobeAlt, HiUserPlus, HiCheck } from 'react-icons/hi2';
import { FaTwitter, FaInstagram, FaBehance } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { PageTransition, Avatar, Badge, EmptyState, StaggerContainer, StaggerItem, ArtworkCardSkeleton, Modal } from '../components/ui';

const ArtistProfile = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commForm, setCommForm] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [commSubmitting, setCommSubmitting] = useState(false);
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistRes, artworksRes] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get(`/api/artworks?artist=${id}&status=published`),
        ]);
        setArtist(artistRes.data.user);
        setArtworks(artworksRes.data.data || []);
        if (user?.following?.some(f => (f._id || f) === id)) setFollowing(true);
      } catch (err) { toast.error('Failed to load artist profile'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow artists');
      navigate('/login');
      return;
    }
    try {
      if (following) {
        await api.delete(`/api/users/${id}/follow`);
        setFollowing(false);
        setArtist(prev => ({ ...prev, followers: prev.followers?.filter(f => f !== user._id) }));
        toast.success('Unfollowed');
      } else {
        await api.post(`/api/users/${id}/follow`);
        setFollowing(true);
        setArtist(prev => ({ ...prev, followers: [...(prev.followers || []), user._id] }));
        toast.success('Following!');
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleCommissionClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to request commissions');
      navigate('/login');
      return;
    }
    if (user?.role !== 'buyer') {
      toast.error('Only collectors can request commissions');
      return;
    }
    setCommissionOpen(true);
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (user?.role !== 'buyer') { toast.error('Only collectors can request commissions'); return; }
    setCommSubmitting(true);
    try {
      await api.post('/api/commissions', {
        artistId: id,
        ...commForm
      });
      toast.success('Commission request sent successfully!');
      setCommissionOpen(false);
      setCommForm({ title: '', description: '', budget: '', deadline: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    } finally {
      setCommSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (!artist) {
    return <EmptyState title="Artist not found" description="This profile doesn't exist" />;
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="h-48 rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(196,93,62,0.15) 0%, rgba(139,126,200,0.15) 50%, rgba(42,125,110,0.1) 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-6 -mt-16 mx-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={artist.name} image={artist.profileImage} size="xl" className="-mt-14 sm:-mt-12 ring-4 ring-gallery-card" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{artist.name}</h1>
                {artist.isVerifiedArtist && (
                  <Badge variant="gold" size="xs"><HiShieldCheck className="w-3.5 h-3.5" /> Verified</Badge>
                )}
              </div>
              {artist.bio && (
                <p className={`text-sm mt-2 max-w-lg ${isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'}`}>
                  {artist.bio}
                </p>
              )}
              <div className={`flex items-center gap-4 mt-3 text-sm ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                <span><strong className={isDark ? 'text-gallery-darkText' : 'text-gallery-text'}>{artworks.length}</strong> artworks</span>
                <span><strong className={isDark ? 'text-gallery-darkText' : 'text-gallery-text'}>{artist.followers?.length || 0}</strong> followers</span>
                <span><strong className={isDark ? 'text-gallery-darkText' : 'text-gallery-text'}>{artist.following?.length || 0}</strong> following</span>
              </div>

              {/* Social Links */}
              {(artist.socialLinks?.website || artist.socialLinks?.twitter || artist.socialLinks?.instagram || artist.socialLinks?.behance) && (
                <div className="flex items-center gap-2 mt-3">
                  {artist.socialLinks.website && (
                    <a href={artist.socialLinks.website} target="_blank" rel="noreferrer" className="btn-ghost !p-2 !rounded-lg">
                      <HiGlobeAlt className="w-4 h-4" />
                    </a>
                  )}
                  {artist.socialLinks.twitter && (
                    <a href={`https://twitter.com/${artist.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="btn-ghost !p-2 !rounded-lg">
                      <FaTwitter className="w-4 h-4" />
                    </a>
                  )}
                  {artist.socialLinks.instagram && (
                    <a href={`https://instagram.com/${artist.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="btn-ghost !p-2 !rounded-lg">
                      <FaInstagram className="w-4 h-4" />
                    </a>
                  )}
                  {artist.socialLinks.behance && (
                    <a href={`https://behance.net/${artist.socialLinks.behance}`} target="_blank" rel="noreferrer" className="btn-ghost !p-2 !rounded-lg">
                      <FaBehance className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {user?._id !== artist._id && (
              <div className="flex gap-3">
                {(!isAuthenticated || user?.role === 'buyer') && (
                  <button onClick={handleCommissionClick} className="btn-secondary">
                    Commission
                  </button>
                )}
                <button onClick={handleFollow}
                  className={following ? 'btn-ghost flex items-center gap-1.5 text-brand-teal' : 'btn-primary'}>
                  {following ? <><HiCheck className="w-4 h-4" /> Following</> : <><HiUserPlus className="w-4 h-4" /> Follow</>}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Artworks */}
        <div className="mt-10">
          <h2 className="font-display text-heading mb-6">Artworks by {artist.name}</h2>
          {artworks.length === 0 ? (
            <EmptyState title="No artworks yet" description="This artist hasn't published any artworks" />
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map(art => (
                <StaggerItem key={art._id}>
                  <Link to={`/artwork/${art._id}`} className="card overflow-hidden hover-tilt block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={art.images?.thumbnail || art.images?.preview} alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm truncate">{art.title}</p>
                      <p className="text-brand-terracotta font-bold text-sm mt-1">₹{art.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>

      {/* Commission Request Modal */}
      <Modal isOpen={commissionOpen} onClose={() => setCommissionOpen(false)} title={`Commission ${artist.name}`} size="md">
        <form onSubmit={handleCommissionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Project Title</label>
            <input
              type="text"
              value={commForm.title}
              onChange={e => setCommForm({ ...commForm, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Custom Portrait, Sci-Fi Landscape"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Detailed Description</label>
            <textarea
              value={commForm.description}
              onChange={e => setCommForm({ ...commForm, description: e.target.value })}
              className="input-field min-h-[120px] resize-none"
              placeholder="Explain the style, dimensions, references, and color scheme..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Budget (₹)</label>
              <input
                type="number"
                value={commForm.budget}
                onChange={e => setCommForm({ ...commForm, budget: e.target.value })}
                className="input-field"
                placeholder="5000"
                min="500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Deadline (Optional)</label>
              <input
                type="date"
                value={commForm.deadline}
                onChange={e => setCommForm({ ...commForm, deadline: e.target.value })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <button type="submit" disabled={commSubmitting} className="btn-primary w-full py-3 mt-2">
            {commSubmitting ? 'Sending Request...' : 'Send Request'}
          </button>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default ArtistProfile;
