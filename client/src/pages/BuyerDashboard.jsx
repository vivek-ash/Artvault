import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShoppingBag, HiHeart, HiUserGroup, HiArrowDownTray, HiDocumentText, HiTrash, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { fetchMyOrders, getDownloadLink } from '../features/order/orderSlice';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import api from '../utils/api';
import { PageTransition, Tabs, Badge, Avatar, EmptyState, StaggerContainer, StaggerItem, StudioSketchpad, CreativeAura } from '../components/ui';
import CommissionNegotiator from '../components/CommissionNegotiator';

const BuyerDashboard = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  
  const updateCommission = (updatedComm) => {
    setCommissions(prev => prev.map(c => c._id === updatedComm._id ? updatedComm : c));
  };
  const { user } = useSelector(s => s.auth);
  const { orders, isLoading: ordersLoading } = useSelector(s => s.order);
  const { items: wishlistItems, isLoading: wishLoading } = useSelector(s => s.wishlist);
  const [activeTab, setActiveTab] = useState('purchases');
  const [following, setFollowing] = useState([]);
  const [commissions, setCommissions] = useState([]);

  useEffect(() => {
    dispatch(fetchMyOrders());
    dispatch(fetchWishlist());
    fetchFollowing();
    fetchCommissions();
  }, [dispatch]);

  const fetchFollowing = async () => {
    try {
      if (user?._id) {
        const { data } = await api.get(`/api/users/${user._id}/following`);
        setFollowing(data.data || []);
      }
    } catch (err) { console.error('Failed to fetch following'); }
  };

  const fetchCommissions = async () => {
    try {
      const { data } = await api.get('/api/commissions?as=buyer');
      setCommissions(data.data || []);
    } catch (err) { console.error('Failed to fetch commissions'); }
  };

  const handleDownload = async (orderId) => {
    try {
      const result = await dispatch(getDownloadLink(orderId)).unwrap();
      if (result.downloadUrl) window.open(result.downloadUrl, '_blank');
      else toast.error('Download not available');
    } catch (err) { toast.error(err || 'Download failed'); }
  };

  const handleCertificate = (orderId) => {
    const token = localStorage.getItem('artvault_token');
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${baseURL}/api/orders/${orderId}/certificate?token=${token}`, '_blank');
  };

  const handleRemoveWishlist = (artworkId) => {
    dispatch(removeFromWishlist(artworkId));
    toast.success('Removed from wishlist');
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}/follow`);
      setFollowing(prev => prev.filter(f => f._id !== userId));
      toast.success('Unfollowed');
    } catch (err) { toast.error('Failed to unfollow'); }
  };

  const completedOrders = orders?.filter(o => o.payment?.status === 'completed') || [];

  const tabs = [
    { id: 'purchases', label: 'My Collection', icon: HiShoppingBag, count: completedOrders.length },
    { id: 'wishlist', label: 'Wishlist', icon: HiHeart, count: wishlistItems?.length || 0 },
    { id: 'following', label: 'Following', icon: HiUserGroup, count: following.length },
    ...(user?.role !== 'artist' ? [{ id: 'commissions', label: 'Commissions', icon: HiChatBubbleLeftEllipsis, count: commissions.length }] : []),
  ];

  const stats = [
    { 
      label: 'Artworks Owned', 
      value: completedOrders.length, 
      gradient: 'from-brand-terracotta to-brand-coral',
      glow: 'shadow-[0_8px_30px_rgba(196,93,62,0.18)]' 
    },
    { 
      label: 'Wishlist Items', 
      value: wishlistItems?.length || 0, 
      gradient: 'from-brand-coral to-brand-gold',
      glow: 'shadow-[0_8px_30px_rgba(217,122,94,0.18)]' 
    },
    { 
      label: 'Following', 
      value: following.length, 
      gradient: 'from-brand-teal to-emerald-500',
      glow: 'shadow-[0_8px_30px_rgba(45,134,134,0.18)]' 
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-title">My Collection</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            Your purchased artworks, wishlist, and followed artists
          </p>
        </div>

        {/* Creative Aura Identity */}
        <div className="mb-8">
          <CreativeAura />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ delay: i * 0.1, duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${s.gradient} ${s.glow} text-white flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Subtle bubble background pattern */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-white/5 blur-md pointer-events-none" />
              <p className="text-3xl font-bold tracking-tight z-10">{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mt-3 z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

        {/* Purchases */}
        {activeTab === 'purchases' && (
          completedOrders.length === 0 ? (
            <EmptyState icon={HiShoppingBag} title="No purchases yet" description="Start building your art collection"
              action={<Link to="/marketplace" className="btn-primary">Explore Marketplace</Link>} />
          ) : (
            <StaggerContainer className="space-y-4">
              {completedOrders.map(order => (
                <StaggerItem key={order._id}>
                  <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Link to={`/artwork/${order.artwork?._id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={order.artwork?.images?.thumbnail} alt={order.artwork?.title} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/artwork/${order.artwork?._id}`} className="font-semibold text-sm hover:text-brand-terracotta transition-colors">{order.artwork?.title}</Link>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                        by {order.artist?.name} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-terracotta font-bold text-sm">₹{order.amount?.toLocaleString()}</span>
                        {order.editionNumber && <Badge variant="gold">Edition #{order.editionNumber}</Badge>}
                        <Badge variant="teal">Owned</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleDownload(order._id)} className="btn-ghost text-xs flex items-center gap-1">
                        <HiArrowDownTray className="w-4 h-4" /> Download
                      </button>
                      <button onClick={() => handleCertificate(order._id)} className="btn-ghost text-xs flex items-center gap-1">
                        <HiDocumentText className="w-4 h-4" /> Certificate
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          !wishlistItems?.length ? (
            <EmptyState icon={HiHeart} title="Wishlist is empty" description="Save artworks you love for later"
              action={<Link to="/marketplace" className="btn-primary">Browse Art</Link>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map(item => {
                const art = item.artwork || item;
                return (
                  <div key={item._id} className="card overflow-hidden hover-tilt group">
                    <Link to={`/artwork/${art._id}`} className="block aspect-[3/4] overflow-hidden">
                      <img src={art.images?.thumbnail || art.images?.preview} alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </Link>
                    <div className="p-4">
                      <p className="font-semibold text-sm truncate">{art.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-brand-terracotta font-bold text-sm">₹{art.price?.toLocaleString()}</span>
                        <button onClick={() => handleRemoveWishlist(art._id)} className="text-red-400 hover:text-red-500 transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Following */}
        {activeTab === 'following' && (
          following.length === 0 ? (
            <EmptyState icon={HiUserGroup} title="Not following anyone" description="Follow artists to see their latest work"
              action={<Link to="/marketplace" className="btn-primary">Discover Artists</Link>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.map(artist => (
                <div key={artist._id} className="card p-5 flex items-center gap-4">
                  <Link to={`/artist/${artist._id}`}>
                    <Avatar name={artist.name} image={artist.profileImage} size="lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/artist/${artist._id}`} className="font-semibold text-sm hover:text-brand-terracotta transition-colors">{artist.name}</Link>
                    <p className={`text-xs truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{artist.bio || 'Artist'}</p>
                  </div>
                  <button onClick={() => handleUnfollow(artist._id)} className="btn-ghost text-xs text-red-400">Unfollow</button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Commissions */}
        {activeTab === 'commissions' && (
          commissions.length === 0 ? (
            <EmptyState icon={HiChatBubbleLeftEllipsis} title="No commissions requested" description="Commission custom artworks from your favorite artists"
              action={<Link to="/marketplace" className="btn-primary">Browse Artists</Link>} />
          ) : (
            <div className="space-y-4">
              {commissions.map(c => (
                <div key={c._id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.artist?.name} image={c.artist?.profileImage} size="md" />
                      <div>
                        <h3 className="font-semibold text-sm">Artist: {c.artist?.name}</h3>
                        <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                          Requested on {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-terracotta">₹{c.budget?.toLocaleString()}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        c.status === 'accepted' ? 'bg-brand-teal/10 text-brand-teal'
                        : c.status === 'rejected' ? 'bg-brand-coral/10 text-brand-coral'
                        : c.status === 'completed' ? 'bg-brand-teal/20 text-brand-teal'
                        : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <CommissionNegotiator commission={c} user={user} onUpdate={updateCommission} isDark={isDark} />
                </div>
              ))}
            </div>
          )
        )}

        <div className="mt-12">
          <StudioSketchpad />
        </div>
      </div>
    </PageTransition>
  );
};

export default BuyerDashboard;
