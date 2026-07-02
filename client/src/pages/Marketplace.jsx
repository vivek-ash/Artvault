import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiFunnel,
  HiXMark,
  HiEye,
  HiHeart,
  HiClock,
  HiSparkles,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { fetchArtworks, setFilters, clearFilters } from '../features/artwork/artworkSlice';

const categories = [
  'All', 'Digital Painting', 'Illustration', '3D Art', 'Pixel Art', 'Photography',
  'Abstract', 'Concept Art', 'Character Design', 'Landscape', 'Portrait',
  'Fan Art', 'Generative Art', 'Other',
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-viewCount', label: 'Most Viewed' },
  { value: '-likeCount', label: 'Most Liked' },
];

const Marketplace = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { artworks, pagination, isLoading, filters } = useSelector((s) => s.artwork);

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    saleType: '',
    sort: '-createdAt',
  });

  useEffect(() => {
    const params = { ...filters };
    if (params.category === 'All') params.category = '';
    dispatch(fetchArtworks(params));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleCategoryClick = (cat) => {
    dispatch(setFilters({ category: cat === 'All' ? '' : cat }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchInput('');
    setLocalFilters({ category: '', minPrice: '', maxPrice: '', saleType: '', sort: '-createdAt' });
  };

  const loadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      dispatch(fetchArtworks({ ...filters, page: pagination.page + 1 }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            The <span className="text-gallery-accent">Gallery</span>
          </h1>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
            Browse our curated collection of digital masterpieces from talented artists worldwide
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gallery-textMuted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search artworks, artists, styles..."
                className="input-field pl-12"
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-all ${
                showFilters
                  ? 'bg-gallery-accent text-gallery-dark border-gallery-accent'
                  : isDark
                    ? 'border-gallery-darkBorder text-gallery-textMuted hover:border-gallery-accent/50'
                    : 'border-gallery-lightBorder text-gallery-textDarkMuted hover:border-gallery-accent/50'
              }`}
            >
              <HiAdjustmentsHorizontal className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((cat) => {
            const isActive = (cat === 'All' && !filters.category) || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isActive
                    ? 'bg-gallery-accent text-gallery-dark border-gallery-accent'
                    : isDark
                      ? 'border-gallery-darkBorder text-gallery-textMuted hover:border-gallery-accent/50 hover:text-gallery-text'
                      : 'border-gallery-lightBorder text-gallery-textDarkMuted hover:border-gallery-accent/50 hover:text-gallery-textDark'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-6 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, minPrice: e.target.value }))}
                  placeholder="0"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="No limit"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  Sort By
                </label>
                <select
                  value={localFilters.sort}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="input-field text-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={applyFilters} className="btn-primary text-sm px-5 py-2">Apply Filters</button>
              <button onClick={handleClearFilters} className="btn-ghost text-sm">Clear All</button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className={`flex items-center justify-between mb-6 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
          <span className="text-sm">
            {pagination ? `${pagination.total} artworks found` : 'Loading...'}
          </span>
        </div>

        {/* Artwork Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`rounded-xl overflow-hidden ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-lightSurface'}`}>
                <div className="aspect-[3/4] animate-pulse bg-gallery-darkSurface" />
                <div className="p-4 space-y-2">
                  <div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightBorder'}`} />
                  <div className={`h-3 rounded w-2/3 animate-pulse ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightBorder'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <HiSparkles className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`} />
            <p className={`text-lg font-display font-semibold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              No artworks found
            </p>
            <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {artworks.map((artwork) => (
              <motion.div key={artwork._id} variants={itemVariants}>
                <Link
                  to={`/artwork/${artwork._id}`}
                  className={`group block rounded-xl overflow-hidden border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    isDark
                      ? 'bg-gallery-darkCard border-gallery-darkBorder hover:border-gallery-accent/20 hover:shadow-gallery-accent/5'
                      : 'bg-gallery-lightCard border-gallery-lightBorder hover:border-gallery-accent/20 hover:shadow-gallery-accent/10'
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {artwork.images?.preview || artwork.images?.thumbnail ? (
                      <img
                        src={artwork.images.preview || artwork.images.thumbnail}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightSurface'}`}>
                        <HiSparkles className="w-10 h-10 text-gallery-accent/30" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {artwork.isLimitedEdition && (
                        <span className="px-2 py-0.5 rounded-md bg-gallery-accent/90 text-gallery-dark text-[10px] font-bold uppercase tracking-wider">
                          Edition {artwork.editionsSold}/{artwork.totalEditions}
                        </span>
                      )}
                      {artwork.saleType === 'auction' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <HiClock className="w-3 h-3" /> Auction
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      >
                        <HiHeart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price tag on hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white font-display text-lg font-bold">
                        ₹{Number(artwork.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-white/70 text-xs flex items-center gap-1">
                        <HiEye className="w-3 h-3" />
                        {artwork.viewCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className={`font-display font-semibold text-sm truncate ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      {artwork.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {artwork.artist?.profileImage ? (
                        <img src={artwork.artist.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gallery-accent/20 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gallery-accent">
                            {artwork.artist?.name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <span className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                        {artwork.artist?.name || 'Unknown Artist'}
                      </span>
                      {artwork.artist?.isVerifiedArtist && (
                        <HiSparkles className="w-3 h-3 text-gallery-accent" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
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
          </motion.div>
        )}

        {/* Load More */}
        {pagination && pagination.page < pagination.pages && (
          <div className="text-center mt-12">
            <button onClick={loadMore} className="btn-secondary">
              Load More Artworks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
