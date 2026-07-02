import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiHeart,
  HiEye,
  HiShieldCheck,
  HiClock,
  HiTag,
  HiSparkles,
  HiFlag,
  HiShoppingCart,
  HiArrowLeft,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { fetchArtwork, fetchRelatedArtworks, clearCurrentArtwork } from '../features/artwork/artworkSlice';
import api from '../utils/api';
import useRazorpay from '../hooks/useRazorpay';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../features/wishlist/wishlistSlice';

const ArtworkDetail = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { currentArtwork: artwork, relatedArtworks, isLoading } = useSelector((s) => s.artwork);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { wishlistedIds } = useSelector((s) => s.wishlist);
  const { initiatePayment } = useRazorpay();
  const navigate = useNavigate();
  const isWishlisted = wishlistedIds[id] || false;

  useEffect(() => {
    dispatch(fetchArtwork(id));
    dispatch(fetchRelatedArtworks(id));
    // Increment view count
    api.post(`/api/artworks/${id}/view`).catch(() => {});
    // Check wishlist status
    if (isAuthenticated) {
      dispatch(checkWishlist(id));
    }

    return () => {
      dispatch(clearCurrentArtwork());
    };
  }, [dispatch, id]);

  if (isLoading || !artwork) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className={`lg:col-span-3 aspect-[4/3] rounded-2xl animate-pulse ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-lightSurface'}`} />
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-6 rounded animate-pulse ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-lightSurface'}`} style={{ width: `${90 - i * 15}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const editionsRemaining = artwork.isLimitedEdition
    ? Math.max(0, artwork.totalEditions - artwork.editionsSold)
    : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/marketplace"
          className={`inline-flex items-center gap-2 mb-8 text-sm transition-colors ${isDark ? 'text-gallery-textMuted hover:text-gallery-text' : 'text-gallery-textDarkMuted hover:text-gallery-textDark'}`}
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Image — Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className={`relative rounded-2xl overflow-hidden border group ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <img
                src={artwork.images?.preview || artwork.images?.thumbnail || ''}
                alt={artwork.title}
                className="w-full object-contain max-h-[70vh] group-hover:scale-105 transition-transform duration-700"
              />
              {/* Preview Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                <HiEye className="w-3.5 h-3.5" />
                Preview Only
              </div>
            </div>
          </motion.div>

          {/* Info — Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Artist Row */}
            <Link
              to={`/artist/${artwork.artist?._id}`}
              className="flex items-center gap-3 group"
            >
              {artwork.artist?.profileImage ? (
                <img src={artwork.artist.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gallery-accent to-amber-600 flex items-center justify-center text-gallery-dark text-sm font-bold">
                  {artwork.artist?.name?.[0] || '?'}
                </div>
              )}
              <div>
                <p className={`font-medium text-sm group-hover:text-gallery-accent transition-colors ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                  {artwork.artist?.name}
                  {artwork.artist?.isVerifiedArtist && (
                    <HiShieldCheck className="inline w-4 h-4 ml-1 text-gallery-accent" />
                  )}
                </p>
                <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  View Artist Profile
                </p>
              </div>
            </Link>

            {/* Title */}
            <h1 className={`font-display text-2xl sm:text-3xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              {artwork.title}
            </h1>

            {/* Category + Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-gallery-accent/15 text-gallery-accent text-xs font-medium">
                {artwork.category}
              </span>
              {artwork.styleTags?.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${isDark ? 'border-gallery-darkBorder text-gallery-textMuted' : 'border-gallery-lightBorder text-gallery-textDarkMuted'}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                {artwork.saleType === 'auction' ? 'Current Bid' : 'Price'}
              </p>
              <p className="text-3xl font-bold text-gallery-accent font-display">
                ₹{Number(artwork.saleType === 'auction' ? artwork.auction?.currentBid || artwork.auction?.startingBid : artwork.price).toLocaleString('en-IN')}
              </p>

              {/* Limited Edition */}
              {artwork.isLimitedEdition && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>
                      {editionsRemaining} of {artwork.totalEditions} remaining
                    </span>
                    <span className="text-gallery-accent font-medium">
                      Edition {artwork.editionsSold + 1}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-lightBorder'}`}>
                    <div
                      className="h-full bg-gallery-accent rounded-full transition-all duration-500"
                      style={{ width: `${(artwork.editionsSold / artwork.totalEditions) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Auction info */}
              {artwork.saleType === 'auction' && artwork.auction?.endTime && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <HiClock className="w-4 h-4 text-gallery-accent" />
                  <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>
                    {artwork.auction.bidCount || 0} bids · Ends {new Date(artwork.auction.endTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) return navigate('/login');
                  if (user?.role !== 'buyer') return;
                  initiatePayment(artwork._id, artwork.title, () => navigate('/dashboard/buyer'));
                }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
              >
                <HiShoppingCart className="w-5 h-5" />
                {artwork.saleType === 'auction' ? 'Place Bid' : 'Buy Now'}
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) return navigate('/login');
                  if (isWishlisted) {
                    dispatch(removeFromWishlist(id));
                    toast.success('Removed from wishlist');
                  } else {
                    dispatch(addToWishlist(id));
                    toast.success('Added to wishlist ❤️');
                  }
                }}
                className={`btn-secondary w-full flex items-center justify-center gap-2 ${isWishlisted ? 'border-red-500/50 text-red-400' : ''}`}
              >
                <HiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-red-400 text-red-400' : ''}`} />
                {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Description */}
            <div>
              <h3 className={`font-display font-semibold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Description
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                {artwork.description}
              </p>
            </div>

            {/* Details */}
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl border ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              {artwork.medium && (
                <div>
                  <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>Medium</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{artwork.medium}</p>
                </div>
              )}
              {artwork.dimensions?.width && (
                <div>
                  <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>Dimensions</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{artwork.dimensions.width} × {artwork.dimensions.height}px</p>
                </div>
              )}
              <div>
                <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>Views</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{artwork.viewCount || 0}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>Resale Royalty</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{artwork.resaleRoyalty || 10}%</p>
              </div>
            </div>

            {/* Report */}
            <button className={`flex items-center gap-1.5 text-xs transition-colors ${isDark ? 'text-gallery-textMuted/50 hover:text-red-400' : 'text-gallery-textDarkMuted/50 hover:text-red-500'}`}>
              <HiFlag className="w-3.5 h-3.5" />
              Report this artwork
            </button>
          </motion.div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className={`font-display text-2xl font-bold mb-8 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArtworks.slice(0, 6).map((related) => (
                <Link
                  key={related._id}
                  to={`/artwork/${related._id}`}
                  className={`group rounded-xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder hover:shadow-xl hover:shadow-gallery-accent/5' : 'bg-gallery-lightCard border-gallery-lightBorder hover:shadow-lg'}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={related.images?.preview || related.images?.thumbnail || ''}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-display font-semibold text-sm truncate ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      {related.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                        {related.artist?.name}
                      </span>
                      <span className="text-gallery-accent font-semibold text-sm">
                        ₹{Number(related.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArtworkDetail;
