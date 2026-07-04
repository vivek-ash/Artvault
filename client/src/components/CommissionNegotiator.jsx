import { useState } from 'react';
import { HiPaperClip, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Avatar from './ui/Avatar';

const CommissionNegotiator = ({ commission, user, onUpdate, isDark }) => {
  const [message, setMessage] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) {
      toast.error('Please enter a message or select an image');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('message', message);
    if (negotiatedPrice) fd.append('negotiatedPrice', negotiatedPrice);
    if (imageFile) fd.append('image', imageFile);

    try {
      const { data } = await api.post(`/api/commissions/${commission._id}/reply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Reply sent!');
      setMessage('');
      setNegotiatedPrice('');
      clearImage();
      if (onUpdate) onUpdate(data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-6 rounded-2xl border p-5 ${
      isDark ? 'bg-gallery-darkSurface border-gallery-darkBorder' : 'bg-gallery-surface border-gallery-border'
    }`}>
      <h3 className="font-display font-semibold text-lg mb-4">Negotiation & Detail Thread</h3>

      {/* Messages Log */}
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
        {/* Original request */}
        <div className={`p-4 rounded-xl border flex gap-3 items-start ${
          isDark ? 'bg-black/10 border-gallery-darkBorder' : 'bg-white/40 border-gallery-border'
        }`}>
          <Avatar name={commission.buyer?.name} image={commission.buyer?.profileImage} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">{commission.buyer?.name} (Collector)</span>
              <span className="text-xs text-gallery-textMuted">Original Request</span>
            </div>
            <p className="text-sm font-semibold text-brand-terracotta">Title: {commission.title}</p>
            <p className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'}`}>
              {commission.description}
            </p>
            <p className="text-xs font-semibold text-brand-teal mt-2">Initial Budget: ₹{commission.budget?.toLocaleString()}</p>
          </div>
        </div>

        {/* Replies */}
        {(commission.replies || []).map((reply, index) => {
          const isSenderMe = reply.sender?._id === user?._id;
          return (
            <div key={reply._id || index} className={`p-4 rounded-xl border flex gap-3 items-start ${
              isSenderMe
                ? 'ml-8 bg-brand-terracotta/5 border-brand-terracotta/25'
                : 'mr-8 bg-brand-teal/5 border-brand-teal/25'
            }`}>
              <Avatar name={reply.sender?.name} image={reply.sender?.profileImage} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{reply.sender?.name}</span>
                  <span className="text-xs text-gallery-textMuted">
                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'}`}>
                  {reply.message}
                </p>
                {reply.negotiatedPrice && (
                  <p className="text-xs font-bold text-brand-terracotta mt-2">
                    Proposed Budget: ₹{reply.negotiatedPrice.toLocaleString()}
                  </p>
                )}
                {/* Attachments */}
                {(reply.attachments || []).map((att, i) => att.url && (
                  <div key={i} className="mt-3 max-w-[200px] rounded-lg overflow-hidden border border-gallery-border bg-black/5">
                    <a href={att.url} target="_blank" rel="noreferrer">
                      <img src={att.url} alt="Attachment" className="w-full h-auto object-cover max-h-[150px] hover:scale-[1.02] transition-transform duration-200" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Form */}
      {commission.status !== 'completed' && commission.status !== 'rejected' && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gallery-border/20">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field min-h-[80px] resize-none py-2.5 px-3 text-sm"
              placeholder="Send details, negotiate budget, or send reference images..."
              required={!imageFile}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Negotiated Price Proposal */}
              <div>
                <input
                  type="number"
                  value={negotiatedPrice}
                  onChange={(e) => setNegotiatedPrice(e.target.value)}
                  className="input-field text-sm w-36 py-1.5 px-3"
                  placeholder="Offer Price (₹)"
                  min="500"
                />
              </div>

              {/* File Upload Input */}
              <div className="relative">
                <label className="btn-ghost flex items-center gap-1.5 py-2 px-3 text-sm rounded-lg cursor-pointer">
                  <HiPaperClip className="w-4 h-4 text-brand-terracotta" />
                  <span>Attach Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary py-2 px-6 text-sm">
              {submitting ? 'Sending...' : 'Send Reply'}
            </button>
          </div>

          {/* Image Preview Thumbnail */}
          {imagePreview && (
            <div className="relative inline-block mt-3 rounded-lg overflow-hidden border border-gallery-border bg-black/5 p-1">
              <img src={imagePreview} alt="Preview" className="w-28 h-20 object-cover rounded-md" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:bg-black"
              >
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CommissionNegotiator;
