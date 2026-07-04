import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUsers, HiPhoto, HiCurrencyRupee, HiFlag, HiMagnifyingGlass, HiNoSymbol, HiCheckCircle, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { PageTransition, Tabs, Badge, Avatar, EmptyState } from '../components/ui';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    users: { total: 0, artists: 0, buyers: 0 },
    artworks: { total: 0, published: 0, reported: 0 },
    orders: { total: 0 },
    revenue: { total: 0, platformFees: 0 }
  });
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); fetchUsers(); fetchArtworks(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data.data || { users: 0, artworks: 0, revenue: 0, reports: 0 });
    } catch (err) { console.error('Stats error'); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users?limit=1000');
      setUsers(data.users || []);
    } catch (err) { console.error('Users error'); }
    finally { setLoading(false); }
  };

  const fetchArtworks = async () => {
    try {
      const { data } = await api.get('/api/artworks?limit=1000');
      setArtworks(data.data || []);
    } catch (err) { console.error('Artworks error'); }
  };

  const toggleSuspend = async (userId, isSuspended) => {
    try {
      await api.put(`/api/users/${userId}`, { isSuspended: !isSuspended });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: !isSuspended } : u));
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
    } catch (err) { toast.error('Failed to update user'); }
  };
  const toggleVerify = async (userId, isVerifiedArtist) => {
    try {
      await api.put(`/api/users/${userId}`, { isVerifiedArtist: !isVerifiedArtist });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerifiedArtist: !isVerifiedArtist } : u));
      toast.success(isVerifiedArtist ? 'Artist unverified' : 'Artist verified!');
    } catch (err) { toast.error('Failed to update artist verification'); }
  };
  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Delete this artwork?')) return;
    try {
      await api.delete(`/api/artworks/${artworkId}`);
      setArtworks(prev => prev.filter(a => a._id !== artworkId));
      toast.success('Artwork deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flaggedArtworks = artworks.filter(a => a.status === 'flagged' || a.reportCount > 0);

  const tabs = [
    { id: 'users', label: 'Users', icon: HiUsers, count: users.length },
    { id: 'artworks', label: 'Artworks', icon: HiPhoto, count: artworks.length },
    { id: 'reports', label: 'Reports', icon: HiFlag, count: flaggedArtworks.length },
  ];

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.users?.total || users.length, 
      icon: HiUsers, 
      gradient: 'from-brand-terracotta to-brand-coral',
      glow: 'shadow-[0_8px_30px_rgba(196,93,62,0.15)]'
    },
    { 
      label: 'Total Artworks', 
      value: stats.artworks?.total || artworks.length, 
      icon: HiPhoto, 
      gradient: 'from-brand-teal to-emerald-500',
      glow: 'shadow-[0_8px_30px_rgba(45,134,134,0.15)]'
    },
    { 
      label: 'Revenue', 
      value: `₹${(stats.revenue?.total || 0).toLocaleString()}`, 
      icon: HiCurrencyRupee, 
      gradient: 'from-brand-gold to-amber-500',
      glow: 'shadow-[0_8px_30px_rgba(201,168,76,0.15)]'
    },
    { 
      label: 'Reports', 
      value: stats.artworks?.reported || flaggedArtworks.length, 
      icon: HiFlag, 
      gradient: 'from-rose-500 to-brand-coral',
      glow: 'shadow-[0_8px_30px_rgba(239,68,68,0.15)]'
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-title">Admin Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            Platform management and moderation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ delay: i * 0.1, duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${s.gradient} ${s.glow} text-white flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Subtle bubble background pattern */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 z-10">
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="relative mb-6">
              <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search users..." className="input-field pl-10" />
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => (
                <div key={u._id} className="card p-4 flex items-center gap-4">
                  {u.role === 'artist' ? (
                    <Link to={`/artist/${u._id}`}>
                      <Avatar name={u.name} image={u.profileImage} size="md" className="cursor-pointer hover:scale-[1.05] transition-transform duration-200" />
                    </Link>
                  ) : (
                    <Avatar name={u.name} image={u.profileImage} size="md" />
                  )}
                  <div className="flex-1 min-w-0">
                    {u.role === 'artist' ? (
                      <Link to={`/artist/${u._id}`} className="font-semibold text-sm hover:text-brand-terracotta transition-colors block">
                        {u.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-sm">{u.name}</p>
                    )}
                    <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{u.email}</p>
                  </div>
                  <Badge variant="auto">{u.role}</Badge>
                  {u.role === 'artist' && u.isVerifiedArtist && <Badge variant="success">Verified</Badge>}
                  {u.isSuspended && <Badge variant="danger">Suspended</Badge>}
                  <div className="flex gap-2">
                    {u.role === 'artist' && (
                      <button onClick={() => toggleVerify(u._id, u.isVerifiedArtist)}
                        className={`btn-ghost text-xs ${u.isVerifiedArtist ? 'text-gallery-textMuted' : 'text-brand-teal'}`}>
                        {u.isVerifiedArtist ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                    <button onClick={() => toggleSuspend(u._id, u.isSuspended)}
                      className={`btn-ghost text-xs ${u.isSuspended ? 'text-brand-teal' : 'text-red-400'}`}>
                      {u.isSuspended ? <><HiCheckCircle className="w-4 h-4" /> Unsuspend</> : <><HiNoSymbol className="w-4 h-4" /> Suspend</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artworks Tab */}
        {activeTab === 'artworks' && (
          <div className="space-y-2">
            {artworks.map(art => (
              <div key={art._id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={art.images?.thumbnail} alt={art.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{art.title}</p>
                  <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                    by {art.artist?.name || 'Unknown'} · ₹{art.price?.toLocaleString()}
                  </p>
                </div>
                <Badge variant="auto">{art.status}</Badge>
                {art.reportCount > 0 && <Badge variant="coral">{art.reportCount} reports</Badge>}
                <button onClick={() => deleteArtwork(art._id)} className="btn-ghost text-xs text-red-400">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          flaggedArtworks.length === 0 ? (
            <EmptyState icon={HiFlag} title="No reports" description="The moderation queue is clear" />
          ) : (
            <div className="space-y-2">
              {flaggedArtworks.map(art => (
                <div key={art._id} className="card p-4 flex items-center gap-4 border-l-4 border-brand-coral">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={art.images?.thumbnail} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{art.title}</p>
                    <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                      {art.reportCount} report{art.reportCount !== 1 ? 's' : ''} · {art.flagReason || 'No reason specified'}
                    </p>
                  </div>
                  <button onClick={() => deleteArtwork(art._id)} className="btn-danger text-xs !py-2 !px-4">Remove</button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
