const Commission = require('../models/Commission');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Create commission request
// @route   POST /api/commissions
// @access  Buyer
exports.createCommission = async (req, res, next) => {
  try {
    const { artistId, title, description, budget, deadline } = req.body;

    if (artistId === req.user._id.toString()) {
      return next(new ErrorResponse('You cannot commission yourself', 400));
    }

    const commission = await Commission.create({
      buyer: req.user._id,
      artist: artistId,
      title,
      description,
      budget,
      deadline: deadline || null,
    });

    // Notify artist
    const notification = await Notification.create({
      recipient: artistId,
      type: 'commission',
      title: 'New Commission Request',
      message: `${req.user.name} wants to commission "${title}" for ₹${budget}`,
      relatedUser: req.user._id,
    });

    const io = req.app.get('io');
    if (io) io.to(artistId).emit('notification', notification);

    res.status(201).json({ success: true, data: commission });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my commissions (as buyer or artist)
// @route   GET /api/commissions
// @access  Protected
exports.getMyCommissions = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'artist'
        ? { artist: req.user._id }
        : { buyer: req.user._id };

    const commissions = await Commission.find(query)
      .populate('buyer', 'name email profileImage')
      .populate('artist', 'name email profileImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: commissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to commission (accept/reject/negotiate)
// @route   PUT /api/commissions/:id/respond
// @access  Artist
exports.respondToCommission = async (req, res, next) => {
  try {
    const { status, artistResponse, negotiatedPrice } = req.body;
    const commission = await Commission.findById(req.params.id);

    if (!commission) return next(new ErrorResponse('Commission not found', 404));
    if (commission.artist.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    commission.status = status;
    if (artistResponse) commission.artistResponse = artistResponse;
    if (negotiatedPrice) commission.negotiatedPrice = negotiatedPrice;
    await commission.save();

    // Notify buyer
    const statusLabels = {
      accepted: 'accepted your commission',
      rejected: 'declined your commission',
      in_progress: 'started working on your commission',
      completed: 'completed your commission',
    };

    await Notification.create({
      recipient: commission.buyer,
      type: 'commission',
      title: `Commission ${status}`,
      message: `${req.user.name} ${statusLabels[status] || 'updated your commission'} "${commission.title}"`,
      relatedUser: req.user._id,
    });

    res.status(200).json({ success: true, data: commission });
  } catch (error) {
    next(error);
  }
};
