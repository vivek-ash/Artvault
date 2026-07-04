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
    const { as } = req.query;
    let query;
    if (as === 'artist') {
      query = { artist: req.user._id };
    } else if (as === 'buyer') {
      query = { buyer: req.user._id };
    } else {
      query = req.user.role === 'artist' ? { artist: req.user._id } : { buyer: req.user._id };
    }

    const commissions = await Commission.find(query)
      .populate('buyer', 'name email profileImage')
      .populate('artist', 'name email profileImage')
      .populate('replies.sender', 'name email profileImage')
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

// @desc    Add reply to commission request (buyer or artist)
// @route   POST /api/commissions/:id/reply
// @access  Protected
exports.addCommissionReply = async (req, res, next) => {
  try {
    const { message, negotiatedPrice } = req.body;
    const commission = await Commission.findById(req.params.id);

    if (!commission) return next(new ErrorResponse('Commission not found', 404));

    // Check if user is either the buyer or the artist
    const isBuyer = commission.buyer.toString() === req.user._id.toString();
    const isArtist = commission.artist.toString() === req.user._id.toString();

    if (!isBuyer && !isArtist) {
      return next(new ErrorResponse('Not authorized to access this commission', 403));
    }

    const attachments = [];
    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'artvault/commissions');
      attachments.push({
        url: uploadResult.original || uploadResult.preview,
        publicId: uploadResult.publicId,
      });
    }

    // Create reply object
    const reply = {
      sender: req.user._id,
      message,
      negotiatedPrice: negotiatedPrice ? Number(negotiatedPrice) : null,
      attachments,
    };

    commission.replies.push(reply);

    // If a negotiated price or response is sent, sync it to the main schema fields
    if (isArtist && negotiatedPrice) {
      commission.negotiatedPrice = Number(negotiatedPrice);
    }
    
    await commission.save();

    // Notify the other party
    const recipientId = isBuyer ? commission.artist : commission.buyer;
    const notification = await Notification.create({
      recipient: recipientId,
      type: 'commission',
      title: 'New Reply on Commission',
      message: `${req.user.name} sent a reply on your commission request`,
      relatedUser: req.user._id,
    });

    const io = req.app.get('io');
    if (io) io.to(recipientId.toString()).emit('notification', notification);

    // Populate and return
    const populated = await Commission.findById(commission._id)
      .populate('buyer', 'name email profileImage')
      .populate('artist', 'name email profileImage')
      .populate('replies.sender', 'name email profileImage');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
