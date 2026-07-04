import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiShieldCheck, HiEye, HiClock, HiFlag, HiXMark, HiMagnifyingGlassPlus, HiShoppingCart, HiUserPlus, HiCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { fetchArtwork, fetchRelatedArtworks, clearCurrentArtwork } from '../features/artwork/artworkSlice';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { createOrder, verifyPayment } from '../features/order/orderSlice';
import useRazorpay from '../hooks/useRazorpay';
import api from '../utils/api';
import { PageTransition, Avatar, Badge, EmptyState, ArtworkCardSkeleton } from '../components/ui';

const ArtworkDetail = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { currentArtwork: artwork, relatedArtworks, isLoading } = useSelector(s => s.artwork);
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { wishlistedIds } = useSelector(s => s.wishlist);
  const [studioOpen, setStudioOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [following, setFollowing] = useState(false);
  const [countdown, setCountdown] = useState('');
  const { initiatePayment } = useRazorpay();

  useEffect(() => {
    dispatch(fetchArtwork(id));
    dispatch(fetchRelatedArtworks(id));
    api.post(`/api/artworks/${id}/view`).catch(() => {});
    return () => {
      dispatch(clearCurrentArtwork());
    };
  }, [id, dispatch]);

  // Auction countdown
  useEffect(() => {
    if (!artwork?.auction?.endTime) return;
    const timer = setInterval(() => {
      const end = new Date(artwork.auction.endTime).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) { setCountdown('Ended'); clearInterval(timer); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [artwork?.auction?.endTime]);

  // Check if following artist
  useEffect(() => {
    if (user?.following && artwork?.artist?._id) {
      setFollowing(user.following.some(f => (f._id || f) === artwork.artist._id));
    }
  }, [user, artwork]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      if (following) {
        await api.delete(`/api/users/${artwork.artist._id}/follow`);
        setFollowing(false);
        toast.success('Unfollowed');
      } else {
        await api.post(`/api/users/${artwork.artist._id}/follow`);
        setFollowing(true);
        toast.success('Following!');
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleBid = async () => {
    if (!bidAmount || Number(bidAmount) <= (artwork?.auction?.currentBid || 0)) {
      toast.error('Bid must be higher than current bid');
      return;
    }
    setBidding(true);
    try {
      await api.post(`/api/artworks/${id}/bid`, { amount: Number(bidAmount) });
      toast.success('Bid placed!');
      dispatch(fetchArtwork(id));
      setBidAmount('');
    } catch (err) { toast.error(err.response?.data?.error || 'Bid failed'); }
    finally { setBidding(false); }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (wishlistedIds[artwork?._id]) dispatch(removeFromWishlist(artwork._id));
    else dispatch(addToWishlist(artwork._id));
  };

  const handleBuy = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    initiatePayment(artwork._id, artwork.title, () => {
      dispatch(fetchArtwork(id));
    });
  };

  const handleReport = async () => {
    try {
      await api.post(`/api/artworks/${id}/report`);
      toast.success('Artwork reported');
    } catch (err) { toast.error('Already reported'); }
  };

  if (isLoading || !artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3"><div className="skeleton aspect-[4/3] rounded-2xl" /></div>
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 w-3/4" /><div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-24" /><div className="skeleton h-12" />
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistedIds[artwork._id];
  const isAuction = artwork.saleType === 'auction';
  const isSoldOut = artwork.isSoldOut || artwork.status === 'sold_out';

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ─── Image ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${
                isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'
              }`}
              onClick={() => setStudioOpen(true)}
            >
              <img
                src={artwork.images?.preview || artwork.images?.thumbnail}
                alt={artwork.title}
                className="w-full object-contain max-h-[70vh] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                  <HiMagnifyingGlassPlus className="w-6 h-6 text-gallery-text" />
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className="badge-gold text-xs">Preview Only</span>
              </div>
            </motion.div>
          </div>

          {/* ─── Info ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artist */}
            <div className="flex items-center justify-between">
              <Link to={`/artist/${artwork.artist?._id}`} className="flex items-center gap-3 group">
                <Avatar name={artwork.artist?.name} image={artwork.artist?.profileImage} size="md" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm group-hover:text-brand-terracotta transition-colors">{artwork.artist?.name}</span>
                    {artwork.artist?.isVerifiedArtist && <HiShieldCheck className="w-4 h-4 text-brand-teal" />}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>Artist</span>
                </div>
              </Link>
              {isAuthenticated && user?._id !== artwork.artist?._id && (
                <button onClick={handleFollow} className={`btn-ghost text-xs flex items-center gap-1.5 ${following ? 'text-brand-teal' : ''}`}>
                  {following ? <><HiCheck className="w-4 h-4" /> Following</> : <><HiUserPlus className="w-4 h-4" /> Follow</>}
                </button>
              )}
            </div>

            {/* Title & Tags */}
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight">{artwork.title}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="terra">{artwork.category}</Badge>
                {artwork.styleTags?.map(tag => <Badge key={tag} variant="default">{tag}</Badge>)}
              </div>
            </div>

            {/* Price Card */}
            <div className={`card-flat p-5 space-y-4`}>
              {isAuction ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>Current Bid</span>
                    <div className="flex items-center gap-2 text-sm">
                      <HiClock className="w-4 h-4 text-brand-coral" />
                      <span className="font-mono text-brand-coral">{countdown || 'Loading...'}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-brand-terracotta">
                    ₹{(artwork.auction?.currentBid || artwork.auction?.startingBid || 0).toLocaleString()}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                    {artwork.auction?.bidCount || 0} bids
                  </p>
                  {isAuthenticated && user?.role !== 'admin' && countdown !== 'Ended' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        placeholder={`Min ₹${(artwork.auction?.currentBid || artwork.auction?.startingBid || 0) + 1}`}
                        className="input-field flex-1"
                      />
                      <button onClick={handleBid} disabled={bidding} className="btn-primary !px-5">
                        {bidding ? 'Bidding...' : 'Bid'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-brand-terracotta">₹{artwork.price?.toLocaleString()}</p>
                  {artwork.isLimitedEdition && (
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span>{artwork.editionsRemaining} of {artwork.totalEditions} remaining</span>
                        <span className="text-brand-gold">Edition {artwork.editionsSold + 1}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'}`}>
                        <div className="h-full bg-brand-terracotta rounded-full transition-all"
                          style={{ width: `${(artwork.editionsSold / artwork.totalEditions) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            {!isSoldOut && !isAuction && (
              <button onClick={handleBuy} className="btn-primary w-full text-base py-3.5">
                <HiShoppingCart className="w-5 h-5" /> Buy Now
              </button>
            )}
            {isSoldOut && <div className="badge-coral w-full text-center py-3 text-base">Sold Out</div>}
            <button onClick={handleWishlist} className={`btn-secondary w-full ${isWishlisted ? '!border-brand-coral !text-brand-coral' : ''}`}>
              <HiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Description */}
            <div>
              <h3 className="font-display font-semibold mb-2">Description</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'}`}>
                {artwork.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'}`}>
              {artwork.medium && <Detail label="Medium" value={artwork.medium} isDark={isDark} />}
              <Detail label="Views" value={artwork.viewCount} isDark={isDark} />
              <Detail label="Resale Royalty" value={`${artwork.resaleRoyalty}%`} isDark={isDark} />
              <Detail label="Sale Type" value={artwork.saleType} isDark={isDark} />
            </div>

            {/* Report */}
            <button onClick={handleReport} className="btn-ghost text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100">
              <HiFlag className="w-3.5 h-3.5" /> Report this artwork
            </button>
          </div>
        </div>

        {/* Related */}
        {relatedArtworks?.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-heading mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArtworks.slice(0, 4).map(art => (
                <Link key={art._id} to={`/artwork/${art._id}`} className="card overflow-hidden hover-tilt">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={art.images?.thumbnail || art.images?.preview} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-sm truncate">{art.title}</p>
                    <p className="text-brand-terracotta font-bold text-sm mt-1">₹{art.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Studio Mode Modal ─────────────────────────────── */}
      <AnimatePresence>
        {studioOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <button onClick={() => { setStudioOpen(false); setZoom(1); }}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <HiXMark className="w-6 h-6" />
            </button>
            <div className="absolute top-6 left-6 z-10 flex gap-2">
              {[1, 1.5, 2].map(z => (
                <button key={z} onClick={() => setZoom(z)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${zoom === z ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {z === 1 ? 'Fit' : `${z * 100}%`}
                </button>
              ))}
            </div>
            <div className="overflow-auto max-w-full max-h-full p-8" style={{ cursor: zoom > 1 ? 'grab' : 'default' }}>
              <motion.img
                src={artwork.images?.preview}
                alt={artwork.title}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="max-h-[90vh] object-contain mx-auto"
                draggable={false}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/10 text-6xl font-display font-bold rotate-[-15deg] select-none">ArtVault Preview</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

const Detail = ({ label, value, isDark }) => (
  <div>
    <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{label}</p>
    <p className="font-semibold text-sm capitalize">{value}</p>
  </div>
);

export default ArtworkDetail;
