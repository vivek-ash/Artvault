import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiUsers,
  HiPhoto,
  HiCurrencyRupee,
  HiFlag,
  HiShieldCheck,
  HiMagnifyingGlass,
  HiNoSymbol,
  HiCheckCircle,
  HiTrash,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const tabs = [
  { id: 'users', label: 'Users', icon: HiUsers },
  { id: 'artworks', label: 'Artworks', icon: HiPhoto },
  { id: 'reports', label: 'Reports', icon: HiFlag },
];

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/users', { params: { search: searchQuery } });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/artworks', { params: { limit: 50 } });
      setArtworks(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch artworks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'artworks' && artworks.length === 0) fetchArtworks();
  }, [activeTab]);

  const handleSuspendUser = async (userId, isSuspended) => {
    try {
      await api.put(`/api/users/${userId}`, { isSuspended: !isSuspended });
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm('Delete this artwork?')) return;
    try {
      await api.delete(`/api/artworks/${artworkId}`);
      toast.success('Artwork deleted');
      setArtworks((prev) => prev.filter((a) => a._id !== artworkId));
    } catch (err) {
      toast.error('Failed to delete artwork');
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.users?.total ?? '...', icon: HiUsers, color: 'text-blue-400' },
    { label: 'Total Artworks', value: stats?.artworks?.total ?? '...', icon: HiPhoto, color: 'text-purple-400' },
    { label: 'Revenue', value: stats?.revenue?.total ? `₹${stats.revenue.total.toLocaleString('en-IN')}` : '₹0', icon: HiCurrencyRupee, color: 'text-green-400' },
    { label: 'Reports', value: stats?.artworks?.reported ?? 0, icon: HiFlag, color: 'text-red-400' },
  ];

  const roleBadge = (role) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400',
      artist: 'bg-purple-500/20 text-purple-400',
      buyer: 'bg-blue-500/20 text-blue-400',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${colors[role] || ''}`;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <HiShieldCheck className="w-8 h-8 text-gallery-accent" />
          <div>
            <h1 className={`font-display text-3xl sm:text-4xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Admin Dashboard
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Platform overview and management
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`p-5 rounded-xl border ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
            >
              <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
              <p className={`font-display text-2xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{s.value}</p>
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
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'users' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <div className={`p-4 border-b flex gap-3 ${isDark ? 'border-gallery-darkBorder bg-gallery-darkCard' : 'border-gallery-lightBorder bg-gallery-lightCard'}`}>
                <div className="relative flex-1 max-w-sm">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-textMuted" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    className="input-field pl-10 text-sm"
                  />
                </div>
                <button onClick={fetchUsers} className="btn-primary text-sm px-4">Search</button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-gallery-darkSurface text-gallery-textMuted' : 'bg-gallery-lightSurface text-gallery-textDarkMuted'}`}>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gallery-darkBorder' : 'divide-gallery-lightBorder'}`}>
                    {users.map((u) => (
                      <tr key={u._id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gallery-accent/20 flex items-center justify-center text-gallery-accent text-xs font-bold">
                              {u.name?.[0]}
                            </div>
                            <span className={`text-sm font-medium ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{u.name}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{u.email}</td>
                        <td className="px-6 py-4"><span className={roleBadge(u.role)}>{u.role}</span></td>
                        <td className="px-6 py-4">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400">Suspended</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-400">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSuspendUser(u._id, u.isSuspended)}
                            className={`p-1.5 rounded-lg transition-colors ${u.isSuspended ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                            title={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          >
                            {u.isSuspended ? <HiCheckCircle className="w-4 h-4" /> : <HiNoSymbol className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className={`text-center py-12 text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'artworks' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-gallery-darkSurface text-gallery-textMuted' : 'bg-gallery-lightSurface text-gallery-textDarkMuted'}`}>
                      <th className="px-6 py-3 text-left">Artwork</th>
                      <th className="px-6 py-3 text-left">Artist</th>
                      <th className="px-6 py-3 text-left">Category</th>
                      <th className="px-6 py-3 text-left">Price</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gallery-darkBorder' : 'divide-gallery-lightBorder'}`}>
                    {artworks.map((a) => (
                      <tr key={a._id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {a.images?.thumbnail ? (
                              <img src={a.images.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gallery-darkSurface flex items-center justify-center">
                                <HiPhoto className="w-5 h-5 text-gallery-textMuted/30" />
                              </div>
                            )}
                            <span className={`text-sm font-medium truncate max-w-[200px] ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>{a.title}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{a.artist?.name || '—'}</td>
                        <td className={`px-6 py-4 text-xs ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>{a.category}</td>
                        <td className="px-6 py-4 text-sm text-gallery-accent font-medium">₹{Number(a.price).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteArtwork(a._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {artworks.length === 0 && (
                  <div className={`text-center py-12 text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                    No artworks found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={`text-center py-20 rounded-xl border border-dashed ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <HiFlag className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted/40' : 'text-gallery-textDarkMuted/40'}`} />
              <p className={`font-display font-semibold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Moderation Queue
              </p>
              <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                {stats?.artworks?.reported ? `${stats.artworks.reported} reported artwork(s)` : 'No reported artworks at this time'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
