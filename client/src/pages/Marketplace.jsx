import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMagnifyingGlass, HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { fetchArtworks, setFilters, clearFilters } from '../features/artwork/artworkSlice';
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  ArtworkCardSkeleton,
  EmptyState,
  Badge,
  Avatar,
} from '../components/ui';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Digital Painting',
  'Illustration',
  '3D Art',
  'Pixel Art',
  'Photography',
  'Abstract',
  'Concept Art',
  'Character Design',
  'Landscape',
  'Portrait',
  'Fan Art',
  'Generative Art',
  'Other',
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: '-viewCount', label: 'Most Popular' },
];

const SALE_TYPES = [
  { value: '', label: 'All' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'auction', label: 'Auction' },
];

// ── Filter Panel Animations ────────────────────────────────────────────────────

const filterPanelVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginBottom: 24,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

// ── Custom Debounce Hook ───────────────────────────────────────────────────────

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Marketplace Page
// ═══════════════════════════════════════════════════════════════════════════════

const Marketplace = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { artworks, pagination, isLoading, filters } = useSelector((s) => s.artwork);

  // ── Local State ────────────────────────────────────────────────────────────

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');
  const [localSort, setLocalSort] = useState(filters.sort || '-createdAt');
  const [localSaleType, setLocalSaleType] = useState(filters.saleType || '');

  // ── Debounced Search ───────────────────────────────────────────────────────

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  // ── Fetch Artworks on Filter Change ────────────────────────────────────────

  useEffect(() => {
    const params = { page: 1, limit: 12, ...filters };
    if (params.category === 'All' || params.category === '') delete params.category;
    if (!params.search) delete params.search;
    if (!params.minPrice) delete params.minPrice;
    if (!params.maxPrice) delete params.maxPrice;
    if (!params.saleType) delete params.saleType;
    dispatch(fetchArtworks(params));
  }, [filters, dispatch]);

  // ── Category Selection ─────────────────────────────────────────────────────

  const handleCategoryClick = useCallback(
    (cat) => {
      dispatch(setFilters({ category: cat === 'All' ? '' : cat }));
    },
    [dispatch]
  );

  // ── Filter Actions ─────────────────────────────────────────────────────────

  const applyFilters = useCallback(() => {
    dispatch(
      setFilters({
        minPrice: localMinPrice,
        maxPrice: localMaxPrice,
        sort: localSort,
        saleType: localSaleType,
      })
    );
    setShowFilters(false);
  }, [dispatch, localMinPrice, localMaxPrice, localSort, localSaleType]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    setSearchInput('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSort('-createdAt');
    setLocalSaleType('');
  }, [dispatch]);

  // ── Load More ──────────────────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.pages) {
      dispatch(
        fetchArtworks({ ...filters, page: pagination.page + 1, limit: 12 })
      );
    }
  }, [dispatch, filters, pagination]);

  // ── Computed ───────────────────────────────────────────────────────────────

  const activeCategory = filters.category || 'All';
  const totalArtworks = pagination?.total ?? 0;
  const showingCount = artworks?.length ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
              <span className="text-gradient">Marketplace</span>
            </h1>
            <p
              className={`text-base sm:text-lg max-w-xl mx-auto leading-relaxed ${
                isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'
              }`}
            >
              Discover and collect extraordinary digital art
            </p>
          </motion.header>

          {/* ── Search Bar ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <HiMagnifyingGlass
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search artworks, artists, styles..."
              className="input-field pl-12 pr-12 py-4 text-base"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gallery-darkTextMuted hover:text-gallery-darkText hover:bg-white/5'
                    : 'text-gallery-textMuted hover:text-gallery-text hover:bg-black/5'
                }`}
              >
                <HiXMark className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* ── Category Pills ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8 -mx-4 px-4"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/25'
                        : isDark
                          ? 'bg-gallery-darkSurface text-gallery-darkTextSecondary hover:text-gallery-darkText hover:bg-gallery-darkCard'
                          : 'bg-gallery-surface text-gallery-textSecondary hover:text-gallery-text hover:bg-gallery-card'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Filter Toggle ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`btn-ghost gap-2 text-sm ${
                showFilters ? 'text-brand-terracotta' : ''
              }`}
            >
              <HiAdjustmentsHorizontal className="w-5 h-5" />
              Filters
              {showFilters && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-terracotta"
                />
              )}
            </button>

            {/* Active filter count */}
            <p
              className={`text-sm ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}
            >
              {isLoading
                ? 'Searching...'
                : `${totalArtworks} artwork${totalArtworks !== 1 ? 's' : ''} found`}
            </p>
          </motion.div>

          {/* ── Expandable Filter Panel ──────────────────────────────────── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filter-panel"
                variants={filterPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <div
                  className={`card p-6 rounded-2xl ${
                    isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Min Price */}
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                        }`}
                      >
                        Min Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(e.target.value)}
                        placeholder="0"
                        className="input-field"
                      />
                    </div>

                    {/* Max Price */}
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                        }`}
                      >
                        Max Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                        placeholder="No limit"
                        className="input-field"
                      />
                    </div>

                    {/* Sort */}
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                        }`}
                      >
                        Sort By
                      </label>
                      <select
                        value={localSort}
                        onChange={(e) => setLocalSort(e.target.value)}
                        className="input-field"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sale Type */}
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                        }`}
                      >
                        Sale Type
                      </label>
                      <div className="flex gap-2">
                        {SALE_TYPES.map((type) => {
                          const active = localSaleType === type.value;
                          return (
                            <button
                              key={type.value}
                              onClick={() => setLocalSaleType(type.value)}
                              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                                active
                                  ? 'bg-brand-terracotta text-white shadow-sm'
                                  : isDark
                                    ? 'bg-gallery-darkSurface text-gallery-darkTextSecondary hover:bg-gallery-darkCard'
                                    : 'bg-gallery-surface text-gallery-textSecondary hover:bg-gallery-card'
                              }`}
                            >
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gallery-border dark-theme:border-gallery-darkBorder">
                    <button onClick={applyFilters} className="btn-primary px-8">
                      Apply
                    </button>
                    <button onClick={handleClearFilters} className="btn-ghost">
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Artwork Grid ─────────────────────────────────────────────── */}
          {isLoading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ArtworkCardSkeleton key={i} />
              ))}
            </div>
          ) : artworks.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon={HiMagnifyingGlass}
              title="No artworks found"
              description="Try adjusting your filters or search terms to discover more art."
              action={
                <button onClick={handleClearFilters} className="btn-secondary mt-2">
                  Clear Filters
                </button>
              }
            />
          ) : (
            /* Artwork Cards */
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => {
                const isSoldOut =
                  artwork.isLimitedEdition &&
                  artwork.editionsSold >= artwork.totalEditions;

                return (
                  <StaggerItem key={artwork._id}>
                    <Link
                      to={`/artwork/${artwork._id}`}
                      className="block group relative"
                    >
                      <div className="card overflow-hidden hover-tilt">
                        {/* ── Image ────────────────────────────────────── */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                          {artwork.images?.preview || artwork.images?.thumbnail ? (
                            <img
                              src={artwork.images.preview || artwork.images.thumbnail}
                              alt={artwork.title}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${
                                isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'
                              }`}
                            >
                              <span
                                className={`text-4xl ${
                                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                                }`}
                                style={{ opacity: 0.3 }}
                              >
                                🎨
                              </span>
                            </div>
                          )}

                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Badges (top-left) */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {artwork.saleType === 'auction' && (
                              <Badge variant="lavender" size="xs">
                                Auction
                              </Badge>
                            )}
                            {artwork.isLimitedEdition && (
                              <Badge variant="gold" size="xs">
                                Limited · {artwork.editionsSold}/{artwork.totalEditions}
                              </Badge>
                            )}
                          </div>

                          {/* Hover price tag (bottom-left) */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                            <span className="text-white font-display text-lg font-bold drop-shadow-lg">
                              ₹{Number(artwork.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Sold Out overlay */}
                          {isSoldOut && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="bg-white/90 text-gallery-text font-display font-bold text-sm px-5 py-2 rounded-full tracking-wider uppercase shadow-lg">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── Content ──────────────────────────────────── */}
                        <div className="p-4">
                          {/* Title */}
                          <h3
                            className={`font-semibold text-sm truncate mb-2 ${
                              isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                            }`}
                          >
                            {artwork.title}
                          </h3>

                          {/* Artist row */}
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar
                              name={artwork.artist?.name || 'Unknown'}
                              image={artwork.artist?.profileImage}
                              size="xs"
                            />
                            <span
                              className={`text-xs truncate ${
                                isDark
                                  ? 'text-gallery-darkTextSecondary'
                                  : 'text-gallery-textSecondary'
                              }`}
                            >
                              {artwork.artist?.name || 'Unknown Artist'}
                            </span>
                          </div>

                          {/* Price + badges row */}
                          <div className="flex items-center justify-between">
                            <span className="text-brand-terracotta font-bold text-sm">
                              ₹{Number(artwork.price || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {artwork.saleType === 'auction' && (
                                <Badge variant="lavender" size="xs">
                                  Auction
                                </Badge>
                              )}
                              {artwork.isLimitedEdition && !isSoldOut && (
                                <Badge variant="gold" size="xs">
                                  Limited
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          {/* ── Load More ────────────────────────────────────────────────── */}
          {!isLoading && pagination && pagination.page < pagination.pages && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center mt-12"
            >
              <button onClick={loadMore} className="btn-secondary px-10">
                Load More
              </button>
              <p
                className={`text-xs mt-3 ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                }`}
              >
                Showing {showingCount} of {totalArtworks} artworks
              </p>
            </motion.div>
          )}

          {/* Show count when all loaded */}
          {!isLoading && artworks.length > 0 && pagination && pagination.page >= pagination.pages && (
            <p
              className={`text-center text-xs mt-8 ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}
            >
              Showing {showingCount} of {totalArtworks} artworks
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Marketplace;
