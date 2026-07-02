const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

// Helper: send JWT token in httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Remove password from output
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: userData,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide name, email, and password', 400));
    }

    // Only allow 'artist' or 'buyer' during registration (no admin self-registration)
    if (role && !['artist', 'buyer'].includes(role)) {
      return next(new ErrorResponse('Invalid role. Only artist or buyer registration is allowed', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('A user with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user — clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'name profileImage')
      .populate('following', 'name profileImage');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile (name, bio, profileImage, socialLinks)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = {
      name: req.body.name,
      bio: req.body.bio,
      profileImage: req.body.profileImage,
      socialLinks: req.body.socialLinks,
    };

    // Remove undefined fields so they don't overwrite existing values
    Object.keys(allowedFields).forEach((key) => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, allowedFields, {
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
    next(err);
  }
};
