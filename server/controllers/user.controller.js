const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all users (with pagination, search, role filter)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = {};

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (req.query.role && ['artist', 'buyer', 'admin'].includes(req.query.role)) {
      query.role = req.query.role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public (artist profiles) — restricted fields for non-admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Build response with follower/following counts
    const userData = user.toObject();
    userData.followersCount = user.followers.length;
    userData.followingCount = user.following.length;

    // For public requests (no auth or non-admin), strip sensitive fields
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      delete userData.email;
      delete userData.isSuspended;
    }

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return next(new ErrorResponse('User not found', 404));
    }
    next(err);
  }
};

// @desc    Update user (admin — role, isSuspended)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Admin can update role and suspension status
    const allowedFields = {};

    if (req.body.role !== undefined) {
      if (!['artist', 'buyer', 'admin'].includes(req.body.role)) {
        return next(new ErrorResponse('Invalid role', 400));
      }
      allowedFields.role = req.body.role;
    }

    if (req.body.isSuspended !== undefined) {
      allowedFields.isSuspended = req.body.isSuspended;
    }

    if (req.body.isVerifiedArtist !== undefined) {
      allowedFields.isVerifiedArtist = req.body.isVerifiedArtist;
    }

    if (Object.keys(allowedFields).length === 0) {
      return next(new ErrorResponse('No valid fields to update', 400));
    }

    const user = await User.findByIdAndUpdate(req.params.id, allowedFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return next(new ErrorResponse('User not found', 404));
    }
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return next(new ErrorResponse('Admin cannot delete their own account', 400));
    }

    // Delete from Firebase Auth if it exists there
    try {
      const { getAuth } = require('firebase-admin/auth');
      const firebaseUser = await getAuth().getUserByEmail(user.email);
      if (firebaseUser) {
        await getAuth().deleteUser(firebaseUser.uid);
        console.log(`Deleted Firebase user: ${user.email}`);
      }
    } catch (firebaseErr) {
      console.warn('Firebase user deletion warning:', firebaseErr.message);
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return next(new ErrorResponse('User not found', 404));
    }
    next(err);
  }
};
