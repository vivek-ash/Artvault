const mongoose = require('mongoose');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/ErrorResponse');
const { logActivity } = require('../utils/auditLogger');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalBuyers,
      totalArtworks,
      publishedArtworks,
      totalOrders,
      revenueResult,
      reportedArtworks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'artist' }),
      User.countDocuments({ role: 'buyer' }),
      Artwork.countDocuments(),
      Artwork.countDocuments({ status: 'published' }),
      Order.countDocuments({ 'payment.status': 'completed' }),
      Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, platformFees: { $sum: '$platformFee' } } },
      ]),
      Artwork.countDocuments({ 'reporting.isReported': true }),
    ]);

    const revenue = revenueResult[0] || { total: 0, platformFees: 0 };

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, artists: totalArtists, buyers: totalBuyers },
        artworks: { total: totalArtworks, published: publishedArtworks, reported: reportedArtworks },
        orders: { total: totalOrders },
        revenue: { total: revenue.total, platformFees: revenue.platformFees },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get artist analytics
// @route   GET /api/admin/analytics/artist
// @access  Artist
exports.getArtistAnalytics = async (req, res, next) => {
  try {
    const artistId = req.user._id;

    // Get sales over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalArtworks,
      totalViews,
      salesOverTime,
      topArtworks,
      totalRevenue,
    ] = await Promise.all([
      Artwork.countDocuments({ artist: artistId }),
      Artwork.aggregate([
        { $match: { artist: artistId } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            artist: artistId,
            'payment.status': 'completed',
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            sales: { $sum: 1 },
            revenue: { $sum: '$artistEarnings' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.find({ artist: artistId, 'payment.status': 'completed' })
        .populate('artwork', 'title images.thumbnail')
        .sort('-amount')
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { artist: artistId, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$artistEarnings' }, count: { $sum: 1 } } },
      ]),
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = salesOverTime.map((item) => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      sales: item.sales,
      revenue: item.revenue,
    }));

    const rev = totalRevenue[0] || { total: 0, count: 0 };
    const views = totalViews[0] || { total: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        totalViews: views.total,
        totalRevenue: rev.total,
        totalSales: rev.count,
        chartData,
        topArtworks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// @desc    Get pending approval artworks
// @route   GET /api/admin/artworks/pending
// @access  Admin
exports.getPendingArtworks = async (req, res, next) => {
  try {
    const artworks = await Artwork.find({ status: 'pending' }).populate('artist', 'name email');
    res.status(200).json({
      success: true,
      count: artworks.length,
      data: artworks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve artwork (publish it)
// @route   PUT /api/admin/artworks/:id/approve
// @access  Admin
exports.approveArtwork = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    artwork.status = 'published';
    await artwork.save();

    // Log administrative action
    await logActivity('artwork_approved', `Approved artwork "${artwork.title}" by artist ${artwork.artist}`, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Artwork approved successfully',
      data: artwork
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject artwork (set back to draft)
// @route   PUT /api/admin/artworks/:id/reject
// @access  Admin
exports.rejectArtwork = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    artwork.status = 'draft';
    await artwork.save();

    // Log administrative action
    await logActivity('artwork_rejected', `Rejected artwork "${artwork.title}" by artist ${artwork.artist} (moved back to drafts)`, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Artwork rejected successfully (moved back to draft)',
      data: artwork
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get global marketplace settings
// @route   GET /api/admin/settings
// @access  Admin
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({ key: 'global', platformFeePercentage: 10 });
    }
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update global marketplace settings
// @route   PUT /api/admin/settings
// @access  Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const { platformFeePercentage } = req.body;
    if (platformFeePercentage === undefined || platformFeePercentage < 0 || platformFeePercentage > 100) {
      return next(new ErrorResponse('Please provide a valid platform fee percentage (0-100)', 400));
    }

    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = new Settings({ key: 'global' });
    }
    settings.platformFeePercentage = platformFeePercentage;
    await settings.save();

    // Log administrative action
    await logActivity('settings_updated', `Updated platform commission fee to ${platformFeePercentage}%`, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get platform activity audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email').sort('-createdAt').limit(100);
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dismiss reports on artwork
// @route   PUT /api/admin/artworks/:id/dismiss-reports
// @access  Admin
exports.dismissArtworkReports = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return next(new ErrorResponse('Artwork not found', 404));
    }

    artwork.reportCount = 0;
    artwork.flagReason = '';
    if (artwork.status === 'flagged') {
      artwork.status = 'published';
    }
    await artwork.save();

    // Log administrative action
    await logActivity('reports_dismissed', `Dismissed all reports for artwork "${artwork.title}"`, req.user._id);

    res.status(200).json({
      success: true,
      message: 'All reports dismissed and cleared successfully',
      data: artwork
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send warning notice to user
// @route   POST /api/admin/users/:id/warn
// @access  Admin
exports.warnUser = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return next(new ErrorResponse('Please provide a warning message', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Log administrative action
    await logActivity('user_warned', `Sent official warning notice to user ${user.name} (${user.email}): "${message}"`, req.user._id);

    // Send real-time Socket.io notification
    const io = req.app.get('socketio');
    if (io) {
      io.to(user._id.toString()).emit('notification', {
        _id: new mongoose.Types.ObjectId(),
        type: 'system',
        title: 'Official Warning Notice',
        message: `An administrator has issued an official warning notice: "${message}"`,
        createdAt: new Date(),
        isRead: false
      });
    }

    res.status(200).json({
      success: true,
      message: `Warning notice successfully sent to ${user.name}`
    });
  } catch (err) {
    next(err);
  }
};
