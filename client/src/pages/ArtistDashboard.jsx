import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaintBrush, HiPhoto, HiChartBar, HiPlus, HiPencil, HiTrash, HiEye, HiXMark, HiCloudArrowUp, HiCheck, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { fetchMyArtworks, createArtwork, updateArtwork, deleteArtwork } from '../features/artwork/artworkSlice';
import { PageTransition, Badge, Modal, EmptyState, Tabs, ArtworkCardSkeleton, StaggerContainer, StaggerItem, Avatar, StudioSketchpad, CreativeAura } from '../components/ui';
import ArtistAnalytics from '../components/ArtistAnalytics';
import api from '../utils/api';
import CommissionNegotiator from '../components/CommissionNegotiator';

const CATEGORIES = ['Digital Painting','Illustration','3D Art','Pixel Art','Photography','Abstract','Concept Art','Character Design','Landscape','Portrait','Fan Art','Generative Art','Other'];

const ArtistDashboard = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  
  const updateCommission = (updatedComm) => {
    setCommissions(prev => prev.map(c => c._id === updatedComm._id ? updatedComm : c));
  };
  const { myArtworks, isLoading, isUploading } = useSelector(s => s.artwork);
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('artworks');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [responseOpen, setResponseOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [respForm, setRespForm] = useState({ status: 'accepted', artistResponse: '', negotiatedPrice: '' });
  const [respSubmitting, setRespSubmitting] = useState(false);

  const openResponse = (comm) => {
    setSelectedCommission(comm);
    setRespForm({
      status: comm.status || 'accepted',
      artistResponse: comm.artistResponse || '',
      negotiatedPrice: comm.negotiatedPrice || '',
    });
    setResponseOpen(true);
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    setRespSubmitting(true);
    try {
      await api.put(`/api/commissions/${selectedCommission._id}/respond`, {
        status: respForm.status,
        artistResponse: respForm.artistResponse,
        negotiatedPrice: respForm.negotiatedPrice ? Number(respForm.negotiatedPrice) : undefined,
      });
      toast.success('Response saved!');
      setResponseOpen(false);
      fetchCommissions();
    } catch (err) {
      toast.error('Failed to save response');
    } finally {
      setRespSubmitting(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      const { data } = await api.get('/api/commissions?as=artist');
      setCommissions(data.data || []);
    } catch (err) { console.error('Failed to load commissions'); }
  };

  useEffect(() => {
    dispatch(fetchMyArtworks());
    fetchCommissions();
  }, [dispatch]);

  function initialForm() {
    return { title: '', description: '', category: 'Digital Painting', medium: '', styleTags: '',
      price: '', saleType: 'fixed', isLimitedEdition: false, totalEditions: '', resaleRoyalty: 10,
      status: 'draft', startingBid: '', auctionDuration: 72 };
  }

  const openCreate = () => {
    setEditingArtwork(null);
    setForm(initialForm());
    setImagePreview(null);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (art) => {
    setEditingArtwork(art);
    setForm({
      title: art.title || '', description: art.description || '', category: art.category || 'Digital Painting',
      medium: art.medium || '', styleTags: art.styleTags?.join(', ') || '', price: art.price || '',
      saleType: art.saleType || 'fixed', isLimitedEdition: art.isLimitedEdition || false,
      totalEditions: art.totalEditions || '', resaleRoyalty: art.resaleRoyalty || 10,
      status: art.status || 'draft', startingBid: art.auction?.startingBid || '', auctionDuration: 72,
    });
    setImagePreview(art.images?.preview || art.images?.thumbnail || null);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('medium', form.medium);
    fd.append('price', form.saleType === 'auction' ? form.startingBid || 0 : form.price);
    fd.append('saleType', form.saleType);
    fd.append('status', form.status);
    fd.append('resaleRoyalty', form.resaleRoyalty);
    fd.append('isLimitedEdition', form.isLimitedEdition);
    if (form.isLimitedEdition) fd.append('totalEditions', form.totalEditions);
    if (form.styleTags) fd.append('styleTags', form.styleTags);
    if (form.saleType === 'auction') {
      fd.append('startingBid', form.startingBid);
      fd.append('auctionDuration', form.auctionDuration);
    }
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editingArtwork) {
        await dispatch(updateArtwork({ id: editingArtwork._id, formData: fd })).unwrap();
        toast.success('Artwork updated!');
      } else {
        if (!imageFile) { toast.error('Please select an image'); return; }
        await dispatch(createArtwork(fd)).unwrap();
        toast.success('Artwork created!');
      }
      setModalOpen(false);
      dispatch(fetchMyArtworks());
    } catch (err) { toast.error(err || 'Failed to save artwork'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artwork permanently?')) return;
    try {
      await dispatch(deleteArtwork(id)).unwrap();
      toast.success('Deleted');
      dispatch(fetchMyArtworks());
    } catch (err) { toast.error('Delete failed'); }
  };

  const tabs = [
    { id: 'artworks', label: 'My Artworks', icon: HiPhoto, count: myArtworks?.length || 0 },
    { id: 'commissions', label: 'Commissions', icon: HiChatBubbleLeftEllipsis, count: commissions.length },
    { id: 'analytics', label: 'Analytics', icon: HiChartBar },
  ];

  const stats = [
    { 
      label: 'Total Artworks', 
      value: myArtworks?.length || 0, 
      gradient: 'from-brand-terracotta to-brand-coral',
      glow: 'shadow-[0_8px_30px_rgba(196,93,62,0.15)]'
    },
    { 
      label: 'Published', 
      value: myArtworks?.filter(a => a.status === 'published').length || 0, 
      gradient: 'from-brand-teal to-emerald-500',
      glow: 'shadow-[0_8px_30px_rgba(45,134,134,0.15)]'
    },
    { 
      label: 'Drafts', 
      value: myArtworks?.filter(a => a.status === 'draft').length || 0, 
      gradient: 'from-brand-gold to-amber-500',
      glow: 'shadow-[0_8px_30px_rgba(201,168,76,0.15)]'
    },
    { 
      label: 'Sold Out', 
      value: myArtworks?.filter(a => a.status === 'sold_out').length || 0, 
      gradient: 'from-rose-500 to-brand-coral',
      glow: 'shadow-[0_8px_30px_rgba(239,68,68,0.15)]'
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-title">Artist Studio</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
              Manage your artworks and track performance
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <HiPlus className="w-5 h-5" /> Upload Artwork
          </button>
        </div>

        {/* Creative Aura Identity */}
        <div className="mb-8">
          <CreativeAura />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
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
              <p className="text-2xl font-bold tracking-tight z-10">{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mt-3 z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

        {/* Tab Content */}
        <div className={activeTab === 'artworks' ? 'block' : 'hidden'}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ArtworkCardSkeleton key={i} />)}
            </div>
          ) : myArtworks?.length === 0 ? (
            <EmptyState icon={HiPhoto} title="No artworks yet" description="Upload your first artwork to start selling"
              action={<button onClick={openCreate} className="btn-primary"><HiPlus className="w-4 h-4" /> Upload</button>} />
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myArtworks.map((art) => (
                <StaggerItem key={art._id}>
                  <div className="card overflow-hidden group">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img src={art.images?.thumbnail || art.images?.preview} alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 left-3">
                        <Badge variant="auto">{art.status}</Badge>
                      </div>
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEdit(art)} className="p-3 bg-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                          <HiPencil className="w-5 h-5 text-brand-terracotta" />
                        </button>
                        <button onClick={() => handleDelete(art._id)} className="p-3 bg-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                          <HiTrash className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{art.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-brand-terracotta font-bold text-sm">₹{art.price?.toLocaleString()}</span>
                          <span className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                            <HiEye className="inline w-3.5 h-3.5 mr-0.5" />{art.viewCount || 0}
                          </span>
                        </div>
                      </div>
                      {/* Mobile action strip */}
                      <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => openEdit(art)} className={`p-2 rounded-xl border transition-colors ${
                          isDark ? 'bg-white/5 border-gallery-darkBorder text-brand-terracotta' : 'bg-black/5 border-gallery-border text-brand-terracotta'
                        }`}>
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(art._id)} className={`p-2 rounded-xl border transition-colors ${
                          isDark ? 'bg-white/5 border-gallery-darkBorder text-red-500' : 'bg-black/5 border-gallery-border text-red-500'
                        }`}>
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>

        <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <ArtistAnalytics />
        </div>

        <div className={activeTab === 'commissions' ? 'block' : 'hidden'}>
          {commissions.length === 0 ? (
            <EmptyState icon={HiChatBubbleLeftEllipsis} title="No commissions requested yet" description="Your commission requests from collectors will show up here" />
          ) : (
            <div className="space-y-4">
              {commissions.map(c => (
                <div key={c._id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.buyer?.name} image={c.buyer?.profileImage} size="md" />
                      <div>
                        <h3 className="font-semibold text-sm">Requested by: {c.buyer?.name}</h3>
                        <p className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                          {c.buyer?.email} · {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gallery-textMuted">Budget</p>
                        <p className="font-bold text-brand-terracotta">₹{c.budget?.toLocaleString()}</p>
                      </div>
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
                  {c.status !== 'completed' && c.status !== 'rejected' && (
                    <button onClick={() => openResponse(c)} className="btn-secondary text-xs mt-4">
                      Update Status
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <StudioSketchpad />
        </div>
      </div>

      {/* ─── Upload/Edit Modal ───────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingArtwork ? 'Edit Artwork' : 'Upload Artwork'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Artwork Image</label>
            <label className={`flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
              ${isDark ? 'border-gallery-darkBorder hover:border-brand-terracotta' : 'border-gallery-border hover:border-brand-terracotta'}
              ${imagePreview ? 'p-0 border-0 overflow-hidden' : 'p-6'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <HiCloudArrowUp className="w-10 h-10 text-brand-terracotta mb-2" />
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className={`text-xs ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>JPEG, PNG, WebP up to 25MB</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-none" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Medium</label>
              <input value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} className="input-field" placeholder="e.g. Digital, Acrylic" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Style Tags</label>
              <input value={form.styleTags} onChange={e => setForm({ ...form, styleTags: e.target.value })} className="input-field" placeholder="Comma-separated" />
            </div>
          </div>

          {/* Sale Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Sale Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['fixed', 'auction'].map(type => (
                <button type="button" key={type} onClick={() => setForm({ ...form, saleType: type })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                    form.saleType === type
                      ? 'border-brand-terracotta bg-brand-terracotta/5 text-brand-terracotta'
                      : isDark ? 'border-gallery-darkBorder' : 'border-gallery-border'
                  }`}>
                  {type === 'fixed' ? 'Fixed Price' : 'Auction'}
                </button>
              ))}
            </div>
          </div>

          {form.saleType === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" required min="0" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Starting Bid (₹)</label>
                <input type="number" value={form.startingBid} onChange={e => setForm({ ...form, startingBid: e.target.value })} className="input-field" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Duration (hours)</label>
                <input type="number" value={form.auctionDuration} onChange={e => setForm({ ...form, auctionDuration: e.target.value })} className="input-field" min="1" />
              </div>
            </div>
          )}

          {/* Limited Edition */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isLimitedEdition} onChange={e => setForm({ ...form, isLimitedEdition: e.target.checked })} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full peer peer-checked:bg-brand-terracotta bg-gallery-border transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
            </label>
            <span className="text-sm font-medium">Limited Edition</span>
          </div>
          {form.isLimitedEdition && (
            <input type="number" value={form.totalEditions} onChange={e => setForm({ ...form, totalEditions: e.target.value })}
              className="input-field" placeholder="Total editions" min="1" required />
          )}

          {/* Resale Royalty */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Resale Royalty: {form.resaleRoyalty}%</label>
            <input type="range" min="0" max="50" value={form.resaleRoyalty} onChange={e => setForm({ ...form, resaleRoyalty: Number(e.target.value) })}
              className="w-full accent-brand-terracotta" />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button type="submit" disabled={isUploading} className="btn-primary w-full">
            {isUploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : editingArtwork ? 'Update Artwork' : 'Upload Artwork'}
          </button>
        </form>
      </Modal>

      {/* Commission Response Modal */}
      <Modal isOpen={responseOpen} onClose={() => setResponseOpen(false)} title="Respond to Commission Request" size="md">
        <form onSubmit={handleResponseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Update Status</label>
            <select
              value={respForm.status}
              onChange={e => setRespForm({ ...respForm, status: e.target.value })}
              className="input-field"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accept</option>
              <option value="in_progress">Mark In Progress</option>
              <option value="completed">Mark Completed</option>
              <option value="rejected">Decline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Your Message / Response Notes</label>
            <textarea
              value={respForm.artistResponse}
              onChange={e => setRespForm({ ...respForm, artistResponse: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="e.g. I can start working on this next week / Here is my proposed timeline..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Negotiated Price (Optional, ₹)</label>
            <input
              type="number"
              value={respForm.negotiatedPrice}
              onChange={e => setRespForm({ ...respForm, negotiatedPrice: e.target.value })}
              className="input-field"
              placeholder={selectedCommission?.budget ? `Original budget: ₹${selectedCommission.budget}` : 'Enter amount if negotiating'}
            />
          </div>
          <button type="submit" disabled={respSubmitting} className="btn-primary w-full py-3 mt-2">
            {respSubmitting ? 'Saving Response...' : 'Save Response'}
          </button>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default ArtistDashboard;
