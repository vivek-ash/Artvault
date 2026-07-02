import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiShoppingBag,
  HiHeart,
  HiUserGroup,
  HiArrowRight,
  HiArrowDownTray,
  HiDocumentText,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { fetchMyOrders } from '../features/order/orderSlice';
import api from '../utils/api';

const tabs = [
  { id: 'purchases', label: 'Purchases', icon: HiShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: HiHeart },
  { id: 'following', label: 'Following', icon: HiUserGroup },
];

const BuyerDashboard = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { orders, isLoading } = useSelector((s) => s.order);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const completedOrders = orders.filter((o) => o.payment?.status === 'completed');

  const handleDownload = async (orderId) => {
    try {
      const res = await api.get(`/api/orders/${orderId}/download`);
      const { downloadUrl, downloadsRemaining } = res.data.data;
      window.open(downloadUrl, '_blank');
      toast.success(`Download started. ${downloadsRemaining} downloads remaining.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Download failed');
    }
  };

  const handleCertificate = async (orderId) => {
    try {
      const res = await api.get(`/api/orders/${orderId}/certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArtVault-Certificate-${orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get certificate');
    }
  };

  const stats = [
    { label: 'Purchases', value: completedOrders.length, icon: HiShoppingBag },
    { label: 'Wishlist', value: 0, icon: HiHeart },
    { label: 'Following', value: user?.following?.length || 0, icon: HiUserGroup },
  ];

  const emptyStates = {
    purchases: {
      icon: HiShoppingBag,
      title: 'No purchases yet',
      desc: 'Start exploring the gallery and collect your first artwork',
      cta: 'Browse Gallery',
      link: '/marketplace',
    },
    wishlist: {
      icon: HiHeart,
      title: 'Your wishlist is empty',
      desc: 'Save artworks you love and come back to them later',
      cta: 'Discover Artworks',
      link: '/marketplace',
    },
    following: {
      icon: HiUserGroup,
      title: "You're not following any artists",
      desc: 'Follow artists to see their new drops in your feed',
      cta: 'Find Artists',
      link: '/marketplace',
    },
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className={`font-display text-3xl sm:text-4xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            My Collection
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
            Welcome back, {user?.name}. Manage your art collection.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className={`p-5 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
            >
              <s.icon className="w-5 h-5 text-gallery-accent mb-2" />
              <p className="font-display text-2xl font-bold text-gallery-accent">{s.value}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightSurface'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gallery-accent text-gallery-dark'
                  : isDark
                    ? 'text-gallery-textMuted hover:text-gallery-text'
                    : 'text-gallery-textDarkMuted hover:text-gallery-textDark'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'purchases' && completedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <div
                  key={order._id}
                  className={`p-4 rounded-xl border flex gap-4 ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
                >
                  {order.artwork?.images?.thumbnail && (
                    <Link to={`/artwork/${order.artwork._id}`}>
                      <img src={order.artwork.images.thumbnail} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/artwork/${order.artwork?._id}`}>
                      <h3 className={`font-display font-semibold text-sm truncate hover:text-gallery-accent transition-colors ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                        {order.artwork?.title || 'Artwork'}
                      </h3>
                    </Link>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                      by {order.artist?.name} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gallery-accent font-semibold text-sm mt-1">₹{Number(order.amount).toLocaleString('en-IN')}</p>
                    {order.certificateId && (
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                        Certificate: {order.certificateId}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDownload(order._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gallery-accent/10 text-gallery-accent text-xs font-medium hover:bg-gallery-accent/20 transition-colors"
                      >
                        <HiArrowDownTray className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button
                        onClick={() => handleCertificate(order._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-white/5 text-gallery-textMuted hover:bg-white/10' : 'bg-black/5 text-gallery-textDarkMuted hover:bg-black/10'}`}
                      >
                        <HiDocumentText className="w-3.5 h-3.5" />
                        Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-20 rounded-xl border border-dashed ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              {(() => {
                const empty = emptyStates[activeTab];
                return (
                  <>
                    <empty.icon className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted/40' : 'text-gallery-textDarkMuted/40'}`} />
                    <p className={`text-lg font-display font-semibold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      {empty.title}
                    </p>
                    <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                      {empty.desc}
                    </p>
                    <Link to={empty.link} className="btn-primary inline-flex items-center gap-2">
                      {empty.cta}
                      <HiArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                );
              })()}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
