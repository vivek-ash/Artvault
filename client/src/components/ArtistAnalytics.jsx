import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  HiEye, HiCurrencyRupee, HiShoppingBag, HiPhoto,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { ArtworkCardSkeleton } from './ui';

const ArtistAnalytics = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/admin/analytics/artist');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-surface'}`} />
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: HiCurrencyRupee, color: 'text-brand-teal' },
    { label: 'Total Sales', value: data?.totalSales || 0, icon: HiShoppingBag, color: 'text-brand-terracotta' },
    { label: 'Total Views', value: (data?.totalViews || 0).toLocaleString(), icon: HiEye, color: 'text-brand-lavender' },
    { label: 'Artworks', value: data?.totalArtworks || 0, icon: HiPhoto, color: 'text-brand-gold' },
  ];

  const chartData = data?.chartData || [];
  
  // Fallback sample data for demo if no real data exists
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: 'Jan', sales: 2, revenue: 5000 },
    { name: 'Feb', sales: 4, revenue: 12000 },
    { name: 'Mar', sales: 3, revenue: 8500 },
    { name: 'Apr', sales: 6, revenue: 18000 },
    { name: 'May', sales: 5, revenue: 15000 },
    { name: 'Jun', sales: 8, revenue: 25000 },
  ];

  const tooltipStyle = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: `1px solid ${isDark ? '#2e2e2e' : '#e8e0d4'}`,
    borderRadius: '12px',
    color: isDark ? '#f5f0e8' : '#1e1e1e',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${
              isDark 
                ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-card' 
                : 'bg-gallery-card border-gallery-border shadow-card'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
              }`}>
                {s.label}
              </span>
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className={`font-display text-2xl font-bold ${
              isDark ? 'text-gallery-darkText' : 'text-gallery-text'
            }`}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border ${
            isDark 
              ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-card' 
              : 'bg-gallery-card border-gallery-border shadow-card'
          }`}
        >
          <h3 className={`font-display font-semibold mb-6 ${
            isDark ? 'text-gallery-darkText' : 'text-gallery-text'
          }`}>
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={displayChartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e8e0d4'} />
              <XAxis dataKey="name" stroke={isDark ? '#8a8a8a' : '#7a7a7a'} fontSize={11} />
              <YAxis stroke={isDark ? '#8a8a8a' : '#7a7a7a'} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border ${
            isDark 
              ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-card' 
              : 'bg-gallery-card border-gallery-border shadow-card'
          }`}
        >
          <h3 className={`font-display font-semibold mb-6 ${
            isDark ? 'text-gallery-darkText' : 'text-gallery-text'
          }`}>
            Sales Per Month
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e8e0d4'} />
              <XAxis dataKey="name" stroke={isDark ? '#8a8a8a' : '#7a7a7a'} fontSize={11} />
              <YAxis stroke={isDark ? '#8a8a8a' : '#7a7a7a'} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="sales" fill="#c45d3e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Artworks */}
      {data?.topArtworks?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border ${
            isDark 
              ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-card' 
              : 'bg-gallery-card border-gallery-border shadow-card'
          }`}
        >
          <h3 className={`font-display font-semibold mb-6 ${
            isDark ? 'text-gallery-darkText' : 'text-gallery-text'
          }`}>
            Top Selling Artworks
          </h3>
          <div className="space-y-3">
            {data.topArtworks.map((item, idx) => (
              <div 
                key={item._id} 
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  isDark 
                    ? 'bg-gallery-darkSurface border-gallery-darkBorder' 
                    : 'bg-gallery-surface border-gallery-border'
                }`}
              >
                <span className="text-brand-terracotta font-bold text-sm w-6">#{idx + 1}</span>
                {item.artwork?.images?.thumbnail && (
                  <img src={item.artwork.images.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover border border-gallery-border dark-theme:border-gallery-darkBorder" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                  }`}>
                    {item.artwork?.title || 'Untitled'}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                  }`}>
                    by you · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-brand-teal font-bold text-sm">
                    ₹{Number(item.artistEarnings).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-gallery-textMuted dark-theme:text-gallery-darkTextMuted">Earnings</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtistAnalytics;
