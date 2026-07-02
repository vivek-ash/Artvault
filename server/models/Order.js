const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    editionNumber: {
      type: Number,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    artistEarnings: {
      type: Number,
      default: 0,
    },
    // Payment
    payment: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
    },
    // Download
    downloadToken: { type: String, default: '' },
    downloadExpiry: { type: Date, default: null },
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 3 },
    // Certificate
    certificateId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Resale tracking
    isResale: { type: Boolean, default: false },
    originalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    resaleRoyaltyPaid: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ buyer: 1 });
orderSchema.index({ artist: 1 });
orderSchema.index({ artwork: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ downloadToken: 1 });

module.exports = mongoose.model('Order', orderSchema);
