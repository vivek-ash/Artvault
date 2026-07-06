import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiUsers, HiPhoto, HiCurrencyRupee, HiFlag, HiMagnifyingGlass,
  HiNoSymbol, HiCheckCircle, HiTrash, HiClock, HiCog6Tooth,
  HiShieldCheck, HiArrowTopRightOnSquare
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { PageTransition, Tabs, Badge, Avatar, EmptyState, Modal } from '../components/ui';

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
  const [pendingArtworks, setPendingArtworks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({ platformFeePercentage: 10 });
  const [feeInput, setFeeInput] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Warning Modal State
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningSubmitting, setWarningSubmitting] = useState(false);

  // User Profile Detail Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Artwork Moderation Modal State
  const [artworkModalOpen, setArtworkModalOpen] = useState(false);
  const [selectedArtworkForModal, setSelectedArtworkForModal] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchArtworks(),
          fetchPendingArtworks(),
          fetchSettings(),
          fetchAuditLogs()
        ]);
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data.data || { users: 0, artworks: 0, revenue: 0, reports: 0 });
    } catch (err) {
      console.error('Stats error');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users?limit=1000');
      setUsers(data.users || []);
    } catch (err) {
      console.error('Users error');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const { data } = await api.get('/api/artworks?limit=1000');
      setArtworks(data.data || []);
    } catch (err) {
      console.error('Artworks error');
    }
  };

  const fetchPendingArtworks = async () => {
    try {
      const { data } = await api.get('/api/admin/artworks/pending');
      setPendingArtworks(data.data || []);
    } catch (err) {
      console.error('Pending artworks error');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/admin/settings');
      setSettings(data.data || { platformFeePercentage: 10 });
      setFeeInput(data.data?.platformFeePercentage ?? 10);
    } catch (err) {
      console.error('Settings error');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await api.get('/api/admin/audit-logs');
      setAuditLogs(data.data || []);
    } catch (err) {
      console.error('Audit logs error');
    }
  };

  const toggleSuspend = async (userId, isSuspended) => {
    try {
      await api.put(`/api/users/${userId}`, { isSuspended: !isSuspended });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: !isSuspended } : u));
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const toggleVerify = async (userId, isVerifiedArtist) => {
    try {
      await api.put(`/api/users/${userId}`, { isVerifiedArtist: !isVerifiedArtist });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerifiedArtist: !isVerifiedArtist } : u));
      toast.success(isVerifiedArtist ? 'Artist unverified' : 'Artist verified!');
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to update artist verification');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user permanently? This will purge all their uploaded artworks and profile data from everywhere.')) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User and all their related assets deleted successfully');
      fetchStats();
      fetchAuditLogs();
      fetchArtworks();
      fetchPendingArtworks();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to remove this artwork permanently?')) return;
    try {
      await api.delete(`/api/artworks/${artworkId}`);
      setArtworks(prev => prev.filter(a => a._id !== artworkId));
      setPendingArtworks(prev => prev.filter(a => a._id !== artworkId));
      toast.success('Artwork deleted successfully');
      fetchStats();
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to delete artwork');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/artworks/${id}/approve`);
      toast.success('Artwork approved and published!');
      setPendingArtworks(prev => prev.filter(a => a._id !== id));
      fetchArtworks();
      fetchStats();
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to approve artwork');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/admin/artworks/${id}/reject`);
      toast.success('Artwork rejected (returned to drafts)');
      setPendingArtworks(prev => prev.filter(a => a._id !== id));
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to reject artwork');
    }
  };

  const handleDismissReports = async (id) => {
    try {
      await api.put(`/api/admin/artworks/${id}/dismiss-reports`);
      toast.success('Reports dismissed successfully');
      setArtworks(prev => prev.map(a => a._id === id ? { ...a, reportCount: 0, flagReason: '', status: a.status === 'flagged' ? 'published' : a.status } : a));
      fetchStats();
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to dismiss reports');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/api/admin/settings', { platformFeePercentage: Number(feeInput) });
      setSettings(data.data);
      toast.success('Platform commission rate updated successfully!');
      fetchAuditLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim()) return;
    setWarningSubmitting(true);
    try {
      await api.post(`/api/admin/users/${selectedUser._id}/warn`, { message: warningMessage });
      toast.success(`Warning notice successfully sent to ${selectedUser.name}`);
      setWarnModalOpen(false);
      setWarningMessage('');
      fetchAuditLogs();
    } catch (err) {
      toast.error('Failed to send warning notice');
    } finally {
      setWarningSubmitting(false);
    }
  };

  const openWarningModal = (user) => {
    setSelectedUser(user);
    setWarningMessage('');
    setWarnModalOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUserForModal(user);
    setUserModalOpen(true);
  };

  const handleArtworkClick = (art) => {
    setSelectedArtworkForModal(art);
    setArtworkModalOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flaggedArtworks = artworks.filter(a => a.status === 'flagged' || a.reportCount > 0);

  const tabs = [
    { id: 'users', label: 'Users', icon: HiUsers, count: users.length },
    { id: 'approvals', label: 'Approvals', icon: HiClock, count: pendingArtworks.length },
    { id: 'artworks', label: 'Artworks', icon: HiPhoto, count: artworks.length },
    { id: 'reports', label: 'Reports', icon: HiFlag, count: flaggedArtworks.length },
    { id: 'settings_logs', label: 'Settings & Logs', icon: HiCog6Tooth },
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
                <div 
                  key={u._id} 
                  onClick={() => handleUserClick(u)}
                  className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-brand-terracotta/35 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Avatar name={u.name} image={u.profileImage} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate hover:text-brand-terracotta transition-colors">{u.name}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="auto">{u.role}</Badge>
                    {u.role === 'artist' && u.isVerifiedArtist && <Badge variant="success">Verified</Badge>}
                    {u.isSuspended && <Badge variant="danger">Suspended</Badge>}
                  </div>

                  <div className="flex gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-end flex-shrink-0">
                    {u.role === 'artist' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleVerify(u._id, u.isVerifiedArtist); }}
                        className={`btn-ghost text-xs ${u.isVerifiedArtist ? 'text-gallery-textMuted' : 'text-brand-teal'}`}
                      >
                        {u.isVerifiedArtist ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); openWarningModal(u); }} 
                      className="btn-ghost text-xs text-brand-gold"
                    >
                      Warn
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSuspend(u._id, u.isSuspended); }}
                      className={`btn-ghost text-xs ${u.isSuspended ? 'text-brand-teal' : 'text-red-400'}`}
                    >
                      {u.isSuspended ? <><HiCheckCircle className="w-4 h-4" /> Unsuspend</> : <><HiNoSymbol className="w-4 h-4" /> Suspend</>}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteUser(u._id); }}
                      className="btn-ghost text-xs text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          pendingArtworks.length === 0 ? (
            <EmptyState icon={HiClock} title="Queue cleared" description="No artworks are currently awaiting approval" />
          ) : (
            <div className="space-y-3">
              {pendingArtworks.map(art => (
                <div 
                  key={art._id} 
                  onClick={() => handleArtworkClick(art)}
                  className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer hover:border-brand-terracotta/35 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gallery-border dark:border-gallery-darkBorder bg-black/5">
                      <img src={art.images?.thumbnail || art.images?.preview} alt={art.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base truncate">{art.title}</p>
                      <p className={`text-sm mt-0.5 truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                        by {art.artist?.name || 'Unknown Artist'} · ₹{art.price?.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="terra" size="xs">{art.category}</Badge>
                        {art.isLimitedEdition && <Badge variant="gold" size="xs">Ltd Edition</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-brand-terracotta flex items-center gap-1">
                      Review Artwork <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Published Artworks Tab */}
        {activeTab === 'artworks' && (
          <div className="space-y-2">
            {artworks.map(art => (
              <div key={art._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={art.images?.thumbnail} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{art.title}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                      by {art.artist?.name || 'Unknown'} · ₹{art.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="auto">{art.status}</Badge>
                  {art.reportCount > 0 && <Badge variant="coral">{art.reportCount} reports</Badge>}
                </div>

                <div className="flex justify-end flex-shrink-0">
                  <button onClick={() => deleteArtwork(art._id)} className="btn-ghost text-xs text-red-400">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
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
                <div key={art._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-brand-coral">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={art.images?.thumbnail} alt={art.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{art.title}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                        {art.reportCount} report{art.reportCount !== 1 ? 's' : ''} · {art.flagReason || 'No reason specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end flex-shrink-0">
                    <button onClick={() => handleDismissReports(art._id)} className="btn-secondary text-xs !py-2 !px-4">
                      Dismiss Reports
                    </button>
                    <button onClick={() => deleteArtwork(art._id)} className="btn-danger text-xs !py-2 !px-4">
                      Remove Artwork
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Settings & Logs Tab */}
        {activeTab === 'settings_logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-6 border border-gallery-border dark:border-gallery-darkBorder">
                <h3 className="font-display font-semibold text-lg text-brand-terracotta mb-4 flex items-center gap-2">
                  <HiCog6Tooth className="w-5 h-5 animate-spin-slow" /> Config Settings
                </h3>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-textMuted dark:text-gallery-darkTextMuted mb-2">
                      Marketplace Platform Fee (%)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={feeInput} 
                        onChange={e => setFeeInput(e.target.value)}
                        className="input-field flex-1" 
                        required 
                      />
                      <span className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-sm font-semibold flex items-center justify-center border border-gallery-border dark:border-gallery-darkBorder">%</span>
                    </div>
                    <p className="text-[10px] text-gallery-textMuted dark:text-gallery-darkTextMuted mt-1.5">
                      Determines the percentage split deducted from buyer checkouts to fund platform operations.
                    </p>
                  </div>
                  <button type="submit" className="btn-primary w-full text-xs">
                    Save Config
                  </button>
                </form>
              </div>
            </div>

            {/* Logs List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-6 border border-gallery-border dark:border-gallery-darkBorder">
                <h3 className="font-display font-semibold text-lg text-brand-terracotta mb-4 flex items-center justify-between">
                  <span>Platform Activity Log</span>
                  <Badge variant="default" size="xs">Live Audits</Badge>
                </h3>

                {auditLogs.length === 0 ? (
                  <EmptyState icon={HiShieldCheck} title="No activity yet" description="Audit trails will log actions automatically" />
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                    {auditLogs.map(log => (
                      <div 
                        key={log._id} 
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                          isDark 
                            ? 'bg-gallery-darkSurface border-gallery-darkBorder' 
                            : 'bg-gallery-surface border-gallery-border'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1.5 flex-wrap">
                          <Badge 
                            variant={
                              log.action.includes('suspend') || log.action.includes('reject') || log.action.includes('warn')
                                ? 'coral' 
                                : log.action.includes('approve') || log.action.includes('purchase') 
                                ? 'teal' 
                                : 'default'
                            } 
                            size="xs"
                          >
                            {log.action}
                          </Badge>
                          <span className="text-[10px] text-gallery-textMuted dark:text-gallery-darkTextMuted font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className={isDark ? 'text-gallery-darkText' : 'text-gallery-text'}>
                          {log.details}
                        </p>
                        {log.user && (
                          <p className="text-[10px] mt-1.5 text-gallery-textMuted dark:text-gallery-darkTextMuted font-medium">
                            Actor: {log.user.name} ({log.user.email})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Info Detail Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="User Profile Details"
        size="md"
      >
        {selectedUserForModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <Avatar name={selectedUserForModal.name} image={selectedUserForModal.profileImage} size="xl" />
              <div>
                <h3 className="text-xl font-display font-bold flex items-center gap-2">
                  {selectedUserForModal.name}
                  {selectedUserForModal.role === 'artist' && selectedUserForModal.isVerifiedArtist && (
                    <HiShieldCheck className="w-5 h-5 text-brand-gold" />
                  )}
                </h3>
                <p className="text-sm text-gallery-textMuted dark:text-gallery-darkTextMuted">{selectedUserForModal.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="auto">{selectedUserForModal.role}</Badge>
                  {selectedUserForModal.isSuspended && <Badge variant="danger">Suspended</Badge>}
                </div>
              </div>
            </div>

            {selectedUserForModal.bio && (
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-gallery-border dark:border-gallery-darkBorder">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gallery-textMuted dark:text-gallery-darkTextMuted mb-2">Biography</h4>
                <p className="text-sm leading-relaxed">{selectedUserForModal.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gallery-textMuted dark:text-gallery-darkTextMuted block">Joined Platform</span>
                <span className="text-sm font-semibold">{new Date(selectedUserForModal.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-xs text-gallery-textMuted dark:text-gallery-darkTextMuted block">Account ID</span>
                <span className="text-sm font-mono text-xs truncate block">{selectedUserForModal._id}</span>
              </div>
            </div>

            {selectedUserForModal.socialLinks && (
              <div className="border-t border-gallery-border dark:border-gallery-darkBorder pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gallery-textMuted dark:text-gallery-darkTextMuted mb-2">Social Profiles</h4>
                <div className="flex flex-wrap gap-3 text-sm">
                  {selectedUserForModal.socialLinks.website && (
                    <a href={selectedUserForModal.socialLinks.website} target="_blank" rel="noreferrer" className="text-brand-teal hover:underline truncate max-w-xs">
                      🌐 Website
                    </a>
                  )}
                  {selectedUserForModal.socialLinks.twitter && (
                    <span className="text-blue-400">🐦 @{selectedUserForModal.socialLinks.twitter}</span>
                  )}
                  {selectedUserForModal.socialLinks.instagram && (
                    <span className="text-pink-500">📸 @{selectedUserForModal.socialLinks.instagram}</span>
                  )}
                  {selectedUserForModal.socialLinks.behance && (
                    <span className="text-blue-500">🎨 @{selectedUserForModal.socialLinks.behance}</span>
                  )}
                </div>
              </div>
            )}

            {/* Profile Actions Bar inside Modal */}
            <div className="border-t border-gallery-border dark:border-gallery-darkBorder pt-5 flex flex-wrap gap-2 justify-end">
              {selectedUserForModal.role === 'artist' && (
                <button 
                  onClick={() => {
                    toggleVerify(selectedUserForModal._id, selectedUserForModal.isVerifiedArtist);
                    setSelectedUserForModal(prev => ({ ...prev, isVerifiedArtist: !prev.isVerifiedArtist }));
                  }}
                  className={`btn-secondary text-xs !py-2 !px-4 ${selectedUserForModal.isVerifiedArtist ? 'text-gallery-textMuted' : 'text-brand-teal'}`}
                >
                  {selectedUserForModal.isVerifiedArtist ? 'Unverify Artist' : 'Verify Artist'}
                </button>
              )}
              <button 
                onClick={() => {
                  setUserModalOpen(false);
                  openWarningModal(selectedUserForModal);
                }} 
                className="btn-secondary text-xs !py-2 !px-4 text-brand-gold"
              >
                Send Warning
              </button>
              <button 
                onClick={() => {
                  toggleSuspend(selectedUserForModal._id, selectedUserForModal.isSuspended);
                  setSelectedUserForModal(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
                }}
                className={`btn-primary text-xs !py-2 !px-4 ${selectedUserForModal.isSuspended ? 'bg-brand-teal' : 'bg-red-500'}`}
              >
                {selectedUserForModal.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
              </button>
              <button 
                onClick={() => {
                  setUserModalOpen(false);
                  deleteUser(selectedUserForModal._id);
                }}
                className="btn-secondary text-xs !py-2 !px-4 text-red-500 hover:!border-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Artwork Moderation Modal */}
      <Modal
        isOpen={artworkModalOpen}
        onClose={() => setArtworkModalOpen(false)}
        title="Review Pending Artwork Submission"
        size="lg"
      >
        {selectedArtworkForModal && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image preview */}
              <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-gallery-border dark:border-gallery-darkBorder flex items-center justify-center relative aspect-video md:aspect-auto md:h-80">
                <img 
                  src={selectedArtworkForModal.images?.preview || selectedArtworkForModal.images?.thumbnail} 
                  alt={selectedArtworkForModal.title} 
                  className="max-w-full max-h-full object-contain"
                />
                <span className="absolute top-3 left-3 badge-gold text-[10px] uppercase tracking-wider font-semibold">
                  Watermarked Preview
                </span>
              </div>

              {/* Right Column: Artwork Metadata details */}
              <div className="space-y-4">
                <div>
                  <Badge variant="terra" size="xs" className="mb-1">{selectedArtworkForModal.category}</Badge>
                  <h3 className="text-xl font-display font-bold leading-tight">{selectedArtworkForModal.title}</h3>
                  <p className="text-lg font-bold text-brand-terracotta mt-1">₹{selectedArtworkForModal.price?.toLocaleString()}</p>
                </div>

                <div className="text-sm space-y-2">
                  <p className={isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}>
                    {selectedArtworkForModal.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-b border-gallery-border dark:border-gallery-darkBorder py-3 text-xs">
                  <div>
                    <span className="text-gallery-textMuted dark:text-gallery-darkTextMuted block">Sale Type</span>
                    <span className="font-semibold uppercase">{selectedArtworkForModal.saleType || 'fixed'}</span>
                  </div>
                  <div>
                    <span className="text-gallery-textMuted dark:text-gallery-darkTextMuted block">Edition Style</span>
                    <span className="font-semibold">
                      {selectedArtworkForModal.isLimitedEdition 
                        ? `Limited Edition (${selectedArtworkForModal.totalEditions} copies)` 
                        : 'Open Edition (Unlimited)'
                      }
                    </span>
                  </div>
                </div>

                {/* Artist Snippet */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-gallery-border dark:border-gallery-darkBorder">
                  <Avatar name={selectedArtworkForModal.artist?.name} image={selectedArtworkForModal.artist?.profileImage} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gallery-textMuted dark:text-gallery-darkTextMuted block">Submitted by Artist</p>
                    <Link 
                      to={`/artist/${selectedArtworkForModal.artist?._id}`}
                      onClick={() => setArtworkModalOpen(false)}
                      className="text-sm font-semibold hover:text-brand-terracotta hover:underline transition-colors block truncate"
                    >
                      {selectedArtworkForModal.artist?.name}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations & Split */}
            <div className="p-4 rounded-xl border border-gallery-border dark:border-gallery-darkBorder bg-gallery-surface dark:bg-gallery-darkSurface text-xs space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-gallery-textMuted dark:text-gallery-darkTextMuted">Marketplace Split Estimate</h4>
              <div className="grid grid-cols-3 gap-4 font-medium pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-black/2.5 dark:bg-white/2.5">
                  <span className="text-gallery-textMuted dark:text-gallery-darkTextMuted block mb-0.5">List Price</span>
                  <span className="text-sm font-bold">₹{selectedArtworkForModal.price?.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-terracotta/5 text-brand-terracotta">
                  <span className="block mb-0.5">Platform Fee ({settings.platformFeePercentage}%)</span>
                  <span className="text-sm font-bold">₹{Math.round(selectedArtworkForModal.price * (settings.platformFeePercentage / 100)).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-teal/5 text-brand-teal">
                  <span className="block mb-0.5">Artist Payout</span>
                  <span className="text-sm font-bold">₹{Math.round(selectedArtworkForModal.price * (1 - settings.platformFeePercentage / 100)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Approve / Reject Actions */}
            <div className="border-t border-gallery-border dark:border-gallery-darkBorder pt-5 flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setArtworkModalOpen(false)} 
                className="btn-secondary !px-4 text-xs"
              >
                Cancel Review
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setArtworkModalOpen(false);
                  handleReject(selectedArtworkForModal._id);
                }} 
                className="btn-secondary !px-4 text-xs text-red-500 hover:!border-red-500"
              >
                Reject Submission
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setArtworkModalOpen(false);
                  handleApprove(selectedArtworkForModal._id);
                }} 
                className="btn-primary !px-5 text-xs flex items-center gap-1.5"
              >
                <HiCheckCircle className="w-4 h-4" /> Approve & Publish
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Official Warning Notice Modal */}
      <Modal 
        isOpen={warnModalOpen} 
        onClose={() => setWarnModalOpen(false)} 
        title={`Send Official Warning — ${selectedUser?.name}`}
        size="md"
      >
        <form onSubmit={handleSendWarning} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gallery-text dark:text-gallery-darkText mb-1.5">
              Warning Reason & Instructions
            </label>
            <textarea 
              value={warningMessage} 
              onChange={e => setWarningMessage(e.target.value)}
              className="input-field min-h-[120px] resize-none" 
              placeholder="Explain the policy violation details clearly (e.g., copyright violation, suspicious behavior)..."
              required 
            />
            <p className="text-[11px] text-gallery-textMuted dark:text-gallery-darkTextMuted mt-1">
              This message will trigger an official warning notification on the user's dashboard.
            </p>
          </div>
          
          <div className="flex gap-2 justify-end pt-3">
            <button 
              type="button" 
              onClick={() => setWarnModalOpen(false)} 
              className="btn-secondary !px-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={warningSubmitting} 
              className="btn-primary !px-5"
            >
              {warningSubmitting ? 'Sending Notice...' : 'Send Warning'}
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default AdminDashboard;
