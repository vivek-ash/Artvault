const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the commission'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Please describe what you want'],
      maxlength: 2000,
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    deadline: {
      type: Date,
      default: null,
    },
    referenceImages: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    artistResponse: {
      type: String,
      default: '',
    },
    negotiatedPrice: {
      type: Number,
      default: null,
    },
    deliveredArtwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

commissionSchema.index({ buyer: 1, status: 1 });
commissionSchema.index({ artist: 1, status: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
