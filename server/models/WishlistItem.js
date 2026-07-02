const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only wishlist an artwork once
wishlistItemSchema.index({ user: 1, artwork: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
