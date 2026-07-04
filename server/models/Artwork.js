const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your artwork'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Digital Painting',
        'Illustration',
        '3D Art',
        'Pixel Art',
        'Photography',
        'Abstract',
        'Concept Art',
        'Character Design',
        'Landscape',
        'Portrait',
        'Fan Art',
        'Generative Art',
        'Other',
      ],
    },
    styleTags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'Cannot have more than 10 style tags',
      },
    },
    medium: {
      type: String,
      default: '',
      maxlength: [100, 'Medium cannot exceed 100 characters'],
    },
    dimensions: {
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    price: {
      type: Number,
      required: [true, 'Please set a price for your artwork'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    // Images — preview (watermarked/low-res) and original (full-res, protected)
    images: {
      preview: {
        type: String, // Cloudinary URL with watermark/low-res transformation
        default: '',
      },
      original: {
        type: String, // Cloudinary URL for full-resolution file (never sent to client publicly)
        default: '',
      },
      thumbnail: {
        type: String, // Small thumbnail for grid views
        default: '',
      },
      publicId: {
        type: String, // Cloudinary public_id for management
        default: '',
      },
    },
    // Additional gallery images
    gallery: [
      {
        preview: String,
        original: String,
        publicId: String,
      },
    ],
    // Limited editions
    isLimitedEdition: {
      type: Boolean,
      default: false,
    },
    totalEditions: {
      type: Number,
      default: null,
      min: [1, 'Total editions must be at least 1'],
    },
    editionsSold: {
      type: Number,
      default: 0,
    },
    // Sale type
    saleType: {
      type: String,
      enum: ['fixed', 'auction'],
      default: 'fixed',
    },
    // Auction fields (only relevant when saleType is 'auction')
    auction: {
      startingBid: { type: Number, default: 0 },
      currentBid: { type: Number, default: 0 },
      highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      endTime: { type: Date, default: null },
      bidCount: { type: Number, default: 0 },
    },
    // Artwork status
    status: {
      type: String,
      enum: ['draft', 'published', 'sold_out', 'flagged', 'archived'],
      default: 'draft',
    },
    // Resale royalty percentage (0-50%)
    resaleRoyalty: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    // Dominant color for color-based search (hex value)
    dominantColor: {
      type: String,
      default: '',
    },
    // Flag/report tracking
    reportCount: {
      type: Number,
      default: 0,
    },
    flagReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
artworkSchema.index({ title: 'text', description: 'text', styleTags: 'text' });

// Regular indexes for filtering
artworkSchema.index({ artist: 1 });
artworkSchema.index({ category: 1 });
artworkSchema.index({ status: 1 });
artworkSchema.index({ price: 1 });
artworkSchema.index({ createdAt: -1 });
artworkSchema.index({ dominantColor: 1 });
artworkSchema.index({ viewCount: -1 });

// Virtual: check if sold out
artworkSchema.virtual('isSoldOut').get(function () {
  if (!this.isLimitedEdition) return false;
  return this.editionsSold >= this.totalEditions;
});

// Virtual: editions remaining
artworkSchema.virtual('editionsRemaining').get(function () {
  if (!this.isLimitedEdition) return null;
  return Math.max(0, this.totalEditions - this.editionsSold);
});

// Pre-save: auto-set status to sold_out if editions exhausted
artworkSchema.pre('save', function (next) {
  if (this.isLimitedEdition && this.editionsSold >= this.totalEditions) {
    this.status = 'sold_out';
  }
  next();
});

module.exports = mongoose.model('Artwork', artworkSchema);
