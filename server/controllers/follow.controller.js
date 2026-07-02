const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Follow an artist
// @route   POST /api/users/:id/follow
// @access  Protected
exports.followUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return next(new ErrorResponse('User not found', 404));
    }
    if (targetUser._id.toString() === req.user._id.toString()) {
      return next(new ErrorResponse('You cannot follow yourself', 400));
    }

    const alreadyFollowing = targetUser.followers.includes(req.user._id);
    if (alreadyFollowing) {
      return next(new ErrorResponse('Already following this user', 400));
    }

    // Add to target's followers
    targetUser.followers.push(req.user._id);
    await targetUser.save();

    // Add to current user's following
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: targetUser._id },
    });

    // Create notification
    const notification = await Notification.create({
      recipient: targetUser._id,
      type: 'follow',
      title: 'New Follower',
      message: `${req.user.name} started following you`,
      relatedUser: req.user._id,
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(targetUser._id.toString()).emit('notification', notification);
    }

    res.status(200).json({
      success: true,
      message: `Now following ${targetUser.name}`,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Protected
exports.unfollowUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!targetUser.followers.includes(req.user._id)) {
      return next(new ErrorResponse('Not following this user', 400));
    }

    // Remove from target's followers
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await targetUser.save();

    // Remove from current user's following
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: targetUser._id },
    });

    res.status(200).json({
      success: true,
      message: `Unfollowed ${targetUser.name}`,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name profileImage bio role isVerifiedArtist');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user.followers,
      count: user.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users that a user is following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name profileImage bio role isVerifiedArtist');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user.following,
      count: user.following.length,
    });
  } catch (error) {
    next(error);
  }
};
