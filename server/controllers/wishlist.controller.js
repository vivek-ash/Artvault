const WishlistItem = require('../models/WishlistItem');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Add artwork to wishlist
// @route   POST /api/wishlist/:artworkId
// @access  Protected
exports.addToWishlist = async (req, res, next) => {
  try {
    const existing = await WishlistItem.findOne({
      user: req.user._id,
      artwork: req.params.artworkId,
    });

    if (existing) {
      return next(new ErrorResponse('Artwork already in wishlist', 400));
    }

    const item = await WishlistItem.create({
      user: req.user._id,
      artwork: req.params.artworkId,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove artwork from wishlist
// @route   DELETE /api/wishlist/:artworkId
// @access  Protected
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOneAndDelete({
      user: req.user._id,
      artwork: req.params.artworkId,
    });

    if (!item) {
      return next(new ErrorResponse('Artwork not in wishlist', 404));
    }

    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Protected
exports.getWishlist = async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ user: req.user._id })
      .populate({
        path: 'artwork',
        select: 'title price images category status artist saleType',
        populate: { path: 'artist', select: 'name profileImage' },
      })
      .sort('-createdAt');

    // Filter out any items where artwork was deleted
    const validItems = items.filter((item) => item.artwork);

    res.status(200).json({
      success: true,
      data: validItems,
      count: validItems.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if artwork is in wishlist
// @route   GET /api/wishlist/check/:artworkId
// @access  Protected
exports.checkWishlist = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOne({
      user: req.user._id,
      artwork: req.params.artworkId,
    });

    res.status(200).json({
      success: true,
      isWishlisted: !!item,
    });
  } catch (error) {
    next(error);
  }
};
