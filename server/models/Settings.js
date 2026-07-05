const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    platformFeePercentage: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
