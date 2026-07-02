const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/ErrorResponse');

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
