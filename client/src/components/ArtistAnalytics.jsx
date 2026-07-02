import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  HiChartBar, HiEye, HiCurrencyRupee, HiShoppingBag, HiPhoto,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const COLORS = ['#c9a84c', '#a78bfa', '#34d399', '#f97316', '#ec4899', '#3b82f6'];

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
          <div key={i} className={`h-64 rounded-xl animate-pulse ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-lightSurface'}`} />
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: HiCurrencyRupee, color: 'text-green-400' },
    { label: 'Total Sales', value: data?.totalSales || 0, icon: HiShoppingBag, color: 'text-gallery-accent' },
    { label: 'Total Views', value: (data?.totalViews || 0).toLocaleString(), icon: HiEye, color: 'text-blue-400' },
    { label: 'Artworks', value: data?.totalArtworks || 0, icon: HiPhoto, color: 'text-purple-400' },
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
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    border: `1px solid ${isDark ? '#2e2e2e' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#faf8f5' : '#1a1a1a',
    fontSize: '12px',
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
            className={`p-5 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
          >
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className={`font-display text-2xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
      >
        <h3 className={`font-display font-semibold mb-6 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
          Revenue Over Time
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={displayChartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#666' : '#999'} fontSize={12} />
            <YAxis stroke={isDark ? '#666' : '#999'} fontSize={12} />
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
        className={`p-6 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
      >
        <h3 className={`font-display font-semibold mb-6 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
          Sales Per Month
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={displayChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#666' : '#999'} fontSize={12} />
            <YAxis stroke={isDark ? '#666' : '#999'} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="sales" fill="#c9a84c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Artworks */}
      {data?.topArtworks?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
        >
          <h3 className={`font-display font-semibold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            Top Selling Artworks
          </h3>
          <div className="space-y-3">
            {data.topArtworks.map((item, idx) => (
              <div key={item._id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightSurface'}`}>
                <span className="text-gallery-accent font-bold text-sm w-6">#{idx + 1}</span>
                {item.artwork?.images?.thumbnail && (
                  <img src={item.artwork.images.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    {item.artwork?.title || 'Untitled'}
                  </p>
                </div>
                <span className="text-gallery-accent font-semibold text-sm">
                  ₹{Number(item.artistEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtistAnalytics;
