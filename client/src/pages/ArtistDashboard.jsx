import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiCloudArrowUp,
  HiXMark,
  HiPhoto,
  HiTag,
  HiCurrencyRupee,
  HiClock,
  HiChartBar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {
  fetchMyArtworks,
  createArtwork,
  deleteArtwork,
} from '../features/artwork/artworkSlice';
import ArtistAnalytics from '../components/ArtistAnalytics';

const categories = [
  'Digital Painting', 'Illustration', '3D Art', 'Pixel Art', 'Photography',
  'Abstract', 'Concept Art', 'Character Design', 'Landscape', 'Portrait',
  'Fan Art', 'Generative Art', 'Other',
];

const ArtistDashboard = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { myArtworks, isLoading, isUploading, pagination } = useSelector((s) => s.artwork);
  const { user } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('artworks');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    styleTags: '',
    medium: '',
    price: '',
    isLimitedEdition: false,
    totalEditions: '',
    saleType: 'fixed',
    status: 'draft',
    resaleRoyalty: 10,
  });

  useEffect(() => {
    dispatch(fetchMyArtworks());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.price) {
      return toast.error('Please fill in all required fields');
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('styleTags', JSON.stringify(form.styleTags.split(',').map((t) => t.trim()).filter(Boolean)));
    formData.append('medium', form.medium);
    formData.append('price', form.price);
    formData.append('isLimitedEdition', form.isLimitedEdition);
    if (form.isLimitedEdition) formData.append('totalEditions', form.totalEditions);
    formData.append('saleType', form.saleType);
    formData.append('status', form.status);
    formData.append('resaleRoyalty', form.resaleRoyalty);
    if (imageFile) formData.append('image', imageFile);

    const result = await dispatch(createArtwork(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Artwork created successfully!');
      setShowUploadModal(false);
      resetForm();
    } else {
      toast.error(result.payload || 'Upload failed');
    }
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', category: '', styleTags: '', medium: '',
      price: '', isLimitedEdition: false, totalEditions: '', saleType: 'fixed',
      status: 'draft', resaleRoyalty: 10,
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    const result = await dispatch(deleteArtwork(id));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Artwork deleted');
    }
  };

  const statusColors = {
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    sold_out: 'bg-red-500/20 text-red-400 border-red-500/30',
    flagged: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
        >
          <div>
            <h1 className={`font-display text-3xl sm:text-4xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Artist Studio
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Welcome back, {user?.name}. Manage your artworks and track performance.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            Upload Artwork
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: 'Total Artworks', value: pagination?.total || myArtworks.length, icon: HiPhoto },
            { label: 'Published', value: myArtworks.filter((a) => a.status === 'published').length, icon: HiEye },
            { label: 'Drafts', value: myArtworks.filter((a) => a.status === 'draft').length, icon: HiPencilSquare },
            { label: 'Total Views', value: myArtworks.reduce((sum, a) => sum + (a.viewCount || 0), 0), icon: HiEye },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-5 rounded-xl border ${
                isDark
                  ? 'bg-gallery-darkCard border-gallery-darkBorder'
                  : 'bg-gallery-lightCard border-gallery-lightBorder'
              }`}
            >
              <stat.icon className="w-5 h-5 text-gallery-accent mb-2" />
              <p className="font-display text-2xl font-bold text-gallery-accent">{stat.value}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-lightSurface'}`}>
          {[
            { id: 'artworks', label: 'My Artworks', icon: HiPhoto },
            { id: 'analytics', label: 'Analytics', icon: HiChartBar },
          ].map((tab) => (
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

        {activeTab === 'analytics' ? (
          <ArtistAnalytics />
        ) : (
        <>
        {/* Artwork Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={`font-display text-xl font-semibold mb-6 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            My Artworks
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-72 rounded-xl animate-pulse ${isDark ? 'bg-gallery-darkCard' : 'bg-gallery-lightSurface'}`}
                />
              ))}
            </div>
          ) : myArtworks.length === 0 ? (
            <div className={`text-center py-20 rounded-xl border border-dashed ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
              <HiCloudArrowUp className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`} />
              <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                No artworks yet
              </p>
              <p className={`text-sm mb-6 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                Upload your first artwork to get started
              </p>
              <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                Upload Your First Artwork
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myArtworks.map((artwork, idx) => (
                <motion.div
                  key={artwork._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`group rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'bg-gallery-darkCard border-gallery-darkBorder hover:shadow-2xl hover:shadow-gallery-accent/5'
                      : 'bg-gallery-lightCard border-gallery-lightBorder hover:shadow-xl'
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gallery-darkSurface">
                    {artwork.images?.thumbnail || artwork.images?.preview ? (
                      <img
                        src={artwork.images.thumbnail || artwork.images.preview}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiPhoto className="w-12 h-12 text-gallery-textMuted/30" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusColors[artwork.status]}`}>
                      {artwork.status}
                    </span>
                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                        <HiPencilSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(artwork._id)}
                        className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className={`font-display font-semibold text-sm truncate ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      {artwork.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gallery-accent font-semibold text-sm">
                        ₹{Number(artwork.price).toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>
                          <HiEye className="inline w-3.5 h-3.5 mr-1" />
                          {artwork.viewCount || 0}
                        </span>
                        {artwork.isLimitedEdition && (
                          <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>
                            {artwork.editionsSold}/{artwork.totalEditions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        </>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 ${
                isDark
                  ? 'bg-gallery-darkCard border-gallery-darkBorder'
                  : 'bg-gallery-lightCard border-gallery-lightBorder'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                  Upload Artwork
                </h2>
                <button
                  onClick={() => { setShowUploadModal(false); resetForm(); }}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gallery-textMuted' : 'hover:bg-black/10 text-gallery-textDarkMuted'}`}
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Artwork Image *
                  </label>
                  <label className={`flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    isDark
                      ? 'border-gallery-darkBorder hover:border-gallery-accent/50 bg-gallery-darkSurface'
                      : 'border-gallery-lightBorder hover:border-gallery-accent/50 bg-gallery-lightSurface'
                  }`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <div className="text-center">
                        <HiCloudArrowUp className="w-10 h-10 mx-auto mb-2 text-gallery-accent/60" />
                        <p className={`text-sm ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                          Click to upload or drag & drop
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gallery-textMuted/60' : 'text-gallery-textDarkMuted/60'}`}>
                          JPEG, PNG, GIF, WebP (max 25MB)
                        </p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter artwork title"
                    className="input-field"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your artwork..."
                    rows={4}
                    className="input-field resize-none"
                    required
                  />
                </div>

                {/* Category + Medium (2-col) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      Category *
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      Medium
                    </label>
                    <input
                      type="text"
                      name="medium"
                      value={form.medium}
                      onChange={handleChange}
                      placeholder="e.g. Oil on canvas, Digital"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Style Tags */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Style Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="styleTags"
                    value={form.styleTags}
                    onChange={handleChange}
                    placeholder="e.g. Surreal, Minimalist, Vibrant"
                    className="input-field"
                  />
                </div>

                {/* Price + Sale Type (2-col) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      Price (INR) *
                    </label>
                    <div className="relative">
                      <HiCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gallery-textMuted" />
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                      Sale Type
                    </label>
                    <select name="saleType" value={form.saleType} onChange={handleChange} className="input-field">
                      <option value="fixed">Fixed Price</option>
                      <option value="auction">Auction</option>
                    </select>
                  </div>
                </div>

                {/* Limited Edition Toggle */}
                <div className={`p-4 rounded-xl border ${isDark ? 'border-gallery-darkBorder bg-gallery-darkSurface' : 'border-gallery-lightBorder bg-gallery-lightSurface'}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                        Limited Edition
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                        Set a maximum number of copies
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isLimitedEdition"
                        checked={form.isLimitedEdition}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full bg-gallery-darkBorder peer-checked:bg-gallery-accent transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  {form.isLimitedEdition && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <input
                        type="number"
                        name="totalEditions"
                        value={form.totalEditions}
                        onChange={handleChange}
                        placeholder="Total editions (e.g. 10)"
                        min="1"
                        className="input-field"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Resale Royalty */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Resale Royalty: {form.resaleRoyalty}%
                  </label>
                  <input
                    type="range"
                    name="resaleRoyalty"
                    value={form.resaleRoyalty}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full accent-gallery-accent"
                  />
                  <div className="flex justify-between text-xs text-gallery-textMuted mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                    Status
                  </label>
                  <div className="flex gap-3">
                    {['draft', 'published'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.status === s
                            ? 'bg-gallery-accent text-gallery-dark border-gallery-accent'
                            : isDark
                              ? 'border-gallery-darkBorder text-gallery-textMuted hover:border-gallery-accent/50'
                              : 'border-gallery-lightBorder text-gallery-textDarkMuted hover:border-gallery-accent/50'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowUploadModal(false); resetForm(); }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gallery-dark border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <HiCloudArrowUp className="w-5 h-5" />
                        Upload Artwork
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistDashboard;
