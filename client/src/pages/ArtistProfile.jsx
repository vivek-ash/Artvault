import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiGlobeAlt, HiSparkles, HiUserPlus, HiPhoto } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const ArtistProfile = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userRes, artRes] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get(`/api/artworks?artist=${id}`),
        ]);
        setArtist(userRes.data.data);
        setArtworks(artRes.data.data || []);
      } catch (err) {
        console.error('Failed to load artist profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gallery-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>Artist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-gallery-accent/20 via-purple-500/10 to-amber-500/20">
        <div className="absolute inset-0 bg-gradient-to-t from-gallery-dark/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`-mt-20 relative z-10 p-6 sm:p-8 rounded-2xl border mb-12 ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            {artist.profileImage ? (
              <img src={artist.profileImage} alt={artist.name} className="w-24 h-24 rounded-full object-cover border-4 border-gallery-accent/30" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center text-gallery-dark text-3xl font-bold font-display">
                {artist.name?.[0]}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className={`font-display text-2xl sm:text-3xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                  {artist.name}
                </h1>
                {artist.isVerifiedArtist && (
                  <HiShieldCheck className="w-6 h-6 text-gallery-accent" />
                )}
              </div>

              {artist.bio && (
                <p className={`text-sm mt-2 max-w-2xl leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  {artist.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                {[
                  { label: 'Artworks', value: artworks.length },
                  { label: 'Followers', value: artist.followersCount || artist.followers?.length || 0 },
                  { label: 'Following', value: artist.followingCount || artist.following?.length || 0 },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-gallery-accent font-bold text-lg font-display">{s.value}</p>
                    <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              {artist.socialLinks && Object.values(artist.socialLinks).some(Boolean) && (
                <div className="flex gap-2 mt-4">
                  {artist.socialLinks.website && (
                    <a href={artist.socialLinks.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-gallery-accent/10 text-gallery-accent hover:bg-gallery-accent/20 transition-colors">
                      <HiGlobeAlt className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Follow Button */}
            <button className="btn-primary flex items-center gap-2 shrink-0">
              <HiUserPlus className="w-5 h-5" />
              Follow
            </button>
          </div>
        </motion.div>

        {/* Artworks Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pb-16"
        >
          <h2 className={`font-display text-xl font-semibold mb-8 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            Artworks by {artist.name}
          </h2>

          {artworks.length === 0 ? (
            <div className={`text-center py-20 rounded-xl border border-dashed ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <HiPhoto className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`} />
              <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>No artworks published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork, idx) => (
                <motion.div
                  key={artwork._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={`/artwork/${artwork._id}`}
                    className={`group block rounded-xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder hover:shadow-xl hover:shadow-gallery-accent/5' : 'bg-gallery-lightCard border-gallery-lightBorder hover:shadow-lg'}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={artwork.images?.preview || artwork.images?.thumbnail || ''}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-display font-semibold text-sm truncate ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                        {artwork.title}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-md ${isDark ? 'bg-gallery-darkSurface text-gallery-textMuted' : 'bg-gallery-lightSurface text-gallery-textDarkMuted'}`}>
                          {artwork.category}
                        </span>
                        <span className="text-gallery-accent font-semibold text-sm">
                          ₹{Number(artwork.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArtistProfile;
