const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');
const { sendPurchaseEmail, sendSaleNotificationEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create order + Razorpay payment
// @route   POST /api/orders
// @access  Buyer only
exports.createOrder = async (req, res, next) => {
  try {
    const { artworkId } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }
    if (artwork.status !== 'published') {
      return next(new ErrorResponse('Artwork is not available for purchase', 400));
    }
    if (artwork.isLimitedEdition && artwork.editionsSold >= artwork.totalEditions) {
      return next(new ErrorResponse('This artwork is sold out', 400));
    }
    if (artwork.artist.toString() === req.user._id.toString()) {
      return next(new ErrorResponse('You cannot purchase your own artwork', 400));
    }

    const amount = artwork.price;
    const platformFee = Math.round(amount * 0.1); // 10% platform fee
    const artistEarnings = amount - platformFee;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    const order = await Order.create({
      buyer: req.user._id,
      artwork: artwork._id,
      artist: artwork.artist,
      amount,
      currency: 'INR',
      platformFee,
      artistEarnings,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/verify
// @access  Protected
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order.payment.razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      order.payment.status = 'failed';
      await order.save();
      return next(new ErrorResponse('Payment verification failed', 400));
    }

    // Payment verified — update order
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.status = 'completed';

    // Generate download token (expires in 72 hours, max 3 downloads)
    order.downloadToken = crypto.randomBytes(32).toString('hex');
    order.downloadExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // Generate certificate ID
    const randomChars = crypto.randomBytes(2).toString('hex').toUpperCase();
    order.certificateId = `AV-${Date.now()}-${randomChars}`;

    // Handle limited edition
    const artwork = await Artwork.findById(order.artwork);
    if (artwork.isLimitedEdition) {
      artwork.editionsSold += 1;
      order.editionNumber = artwork.editionsSold;
      await artwork.save();
    }

    await order.save();

    // Create notification for artist
    const notification = await Notification.create({
      recipient: order.artist,
      type: 'sale',
      title: 'New Sale! 🎉',
      message: `Your artwork "${artwork.title}" was purchased for ₹${order.amount}`,
      relatedUser: order.buyer,
      relatedArtwork: order.artwork,
      relatedOrder: order._id,
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(order.artist.toString()).emit('notification', notification);
    }

    // Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('artwork', 'title images.thumbnail category')
      .populate('artist', 'name email')
      .populate('buyer', 'name email');

    res.status(200).json({
      success: true,
      data: populatedOrder,
    });

    // Send emails (non-blocking, after response)
    if (populatedOrder.buyer?.email) {
      sendPurchaseEmail(
        populatedOrder.buyer.email,
        populatedOrder.buyer.name,
        populatedOrder.artwork?.title || 'Artwork',
        populatedOrder.amount,
        populatedOrder.certificateId
      );
    }
    if (populatedOrder.artist?.email) {
      sendSaleNotificationEmail(
        populatedOrder.artist.email,
        populatedOrder.artist.name,
        populatedOrder.artwork?.title || 'Artwork',
        populatedOrder.artistEarnings || populatedOrder.amount
      );
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my-orders
// @access  Protected
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query =
      req.user.role === 'artist'
        ? { artist: req.user._id }
        : { buyer: req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('artwork', 'title images.thumbnail images.preview category price')
        .populate('buyer', 'name email profileImage')
        .populate('artist', 'name email profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Protected (buyer, artist, or admin)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('artwork', 'title images category price description artist')
      .populate('buyer', 'name email profileImage')
      .populate('artist', 'name email profileImage');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Only buyer, artist, or admin can view
    const isAuthorized =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.artist._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return next(new ErrorResponse('Not authorized to view this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get secure download link (original full-res artwork)
// @route   GET /api/orders/:id/download
// @access  Buyer only (must own the order)
exports.getDownloadLink = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('artwork');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }
    if (order.buyer.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    if (order.payment.status !== 'completed') {
      return next(new ErrorResponse('Payment not completed', 400));
    }
    if (!order.downloadToken || new Date() > order.downloadExpiry) {
      return next(new ErrorResponse('Download link has expired. Contact support.', 410));
    }
    if (order.downloadCount >= order.maxDownloads) {
      return next(new ErrorResponse('Maximum download limit reached', 403));
    }

    // Increment download count
    order.downloadCount += 1;
    await order.save();

    // Return the original (full-res) image URL — this is the ONLY place it's exposed
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: order.artwork.images.original,
        downloadsRemaining: order.maxDownloads - order.downloadCount,
        expiresAt: order.downloadExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Certificate of Authenticity PDF
// @route   GET /api/orders/:id/certificate
// @access  Buyer only (must own the order)
exports.getCertificate = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('artwork', 'title')
      .populate('buyer', 'name')
      .populate('artist', 'name');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    if (order.payment.status !== 'completed') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    const { generateCertificate } = require('../utils/certificate');

    const pdfBuffer = await generateCertificate({
      certificateId: order.certificateId,
      buyerName: order.buyer.name,
      artistName: order.artist.name,
      artworkTitle: order.artwork.title,
      purchaseDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      editionNumber: order.editionNumber,
      totalEditions: order.editionNumber ? order.artwork.totalEditions : null,
      amount: order.amount,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ArtVault-Certificate-${order.certificateId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
