const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'follow', 'bid', 'outbid', 'commission', 'system', 'artwork_flagged'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedArtwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      default: null,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
