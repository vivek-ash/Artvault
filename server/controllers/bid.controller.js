const Artwork = require('../models/Artwork');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Place a bid on an auction artwork
// @route   POST /api/artworks/:id/bid
// @access  Protected (buyer)
exports.placeBid = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) return next(new ErrorResponse('Artwork not found', 404));
    if (artwork.saleType !== 'auction') {
      return next(new ErrorResponse('This artwork is not an auction', 400));
    }
    if (artwork.status !== 'published') {
      return next(new ErrorResponse('This auction is not active', 400));
    }
    if (artwork.artist.toString() === req.user._id.toString()) {
      return next(new ErrorResponse('You cannot bid on your own artwork', 400));
    }
    if (artwork.auction.endTime && new Date() > artwork.auction.endTime) {
      return next(new ErrorResponse('This auction has ended', 400));
    }

    const minBid = artwork.auction.currentBid > 0
      ? artwork.auction.currentBid + 1
      : artwork.auction.startingBid;

    if (amount < minBid) {
      return next(new ErrorResponse(`Bid must be at least ₹${minBid}`, 400));
    }

    const previousBidder = artwork.auction.highestBidder;

    artwork.auction.currentBid = amount;
    artwork.auction.highestBidder = req.user._id;
    artwork.auction.bidCount += 1;
    await artwork.save();

    // Notify artist
    await Notification.create({
      recipient: artwork.artist,
      type: 'bid',
      title: 'New Bid!',
      message: `${req.user.name} bid ₹${amount} on "${artwork.title}"`,
      relatedUser: req.user._id,
      relatedArtwork: artwork._id,
    });

    // Notify previous highest bidder (outbid)
    if (previousBidder && previousBidder.toString() !== req.user._id.toString()) {
      const outbidNotif = await Notification.create({
        recipient: previousBidder,
        type: 'outbid',
        title: 'You\'ve been outbid!',
        message: `Someone bid ₹${amount} on "${artwork.title}", surpassing your bid`,
        relatedArtwork: artwork._id,
      });

      const io = req.app.get('io');
      if (io) io.to(previousBidder.toString()).emit('notification', outbidNotif);
    }

    const io = req.app.get('io');
    if (io) io.to(artwork.artist.toString()).emit('notification', { type: 'bid' });

    res.status(200).json({
      success: true,
      data: {
        currentBid: artwork.auction.currentBid,
        bidCount: artwork.auction.bidCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
