const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const { sendWelcomeEmail } = require('../utils/email');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { logActivity } = require('../utils/auditLogger');

// Helper: send JWT token in httpOnly cookie + response body
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
      token, // Also send in body for cross-domain (Bearer auth)
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

    // Log activity
    await logActivity('user_registered', `User ${user.name} registered as a ${user.role} (${user.email})`, user._id);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name, user.role);

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

    // Log activity
    await logActivity('user_login', `User ${user.name} logged in (${user.email})`, user._id);

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

// @desc    Authenticate with Firebase ID Token (Login/Register fallback)
// @route   POST /api/auth/firebase-auth
// @access  Public
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken, name, role } = req.body;

    if (!idToken) {
      return next(new ErrorResponse('Please provide a Firebase ID token', 400));
    }

    // Verify token using Firebase Admin SDK
    if (admin.getApps().length === 0) {
      return next(new ErrorResponse('Firebase Admin SDK is not initialized on the backend. Please add FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_JSON to your backend Render Environment Variables.', 500));
    }
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (err) {
      console.error('Firebase verifyIdToken error inside firebaseAuth:', err);
      return next(new ErrorResponse(`Invalid or expired Firebase ID token: ${err.message}`, 401));
    }

    const { email, email_verified, name: decodedName } = decodedToken;

    // Check if email is verified
    if (!email_verified) {
      return next(new ErrorResponse('Please verify your email address before logging in.', 401));
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });

    if (user) {
      // Check if account is suspended
      if (user.isSuspended) {
        return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
      }
      // Log event
      await logActivity('user_login', `User ${user.name} logged in via Firebase (${user.email})`, user._id);
      // Log in existing user
      return sendTokenResponse(user, 200, res);
    }

    // Register new user
    // Only allow 'artist' or 'buyer' for new accounts
    const targetRole = role || 'buyer';
    if (!['artist', 'buyer'].includes(targetRole)) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }

    // Generate a secure random password for DB requirements (user will login with Firebase anyway)
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + 'A1!';

    user = await User.create({
      name: name || decodedName || email.split('@')[0],
      email,
      password: randomPassword,
      role: targetRole,
      isVerifiedArtist: false // New artists start unverified
    });

    // Log event
    await logActivity('user_registered', `User ${user.name} registered via Firebase Auth as ${user.role} (${user.email})`, user._id);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name, user.role);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new user in MongoDB authenticated by Firebase (email verification pending)
// @route   POST /api/auth/firebase-register
// @access  Public
exports.firebaseRegister = async (req, res, next) => {
  try {
    const { idToken, name, role } = req.body;

    if (!idToken || !name) {
      return next(new ErrorResponse('Please provide a Firebase ID token and name', 400));
    }

    // Verify token using Firebase Admin SDK
    if (admin.getApps().length === 0) {
      return next(new ErrorResponse('Firebase Admin SDK is not initialized on the backend. Please add FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_JSON to your backend Render Environment Variables.', 500));
    }
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (err) {
      console.error('Firebase verifyIdToken error inside firebaseRegister:', err);
      return next(new ErrorResponse(`Invalid or expired Firebase ID token: ${err.message}`, 401));
    }

    const { email } = decodedToken;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });

    if (user) {
      // Re-link: update name/role and randomize password to migrate completely to Firebase
      if (name) user.name = name;
      if (role && ['artist', 'buyer'].includes(role)) user.role = role;
      
      // Randomize password to invalidate local MongoDB login credentials
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + 'A1!';
      user.password = randomPassword;
      
      await user.save();

      // Log event
      await logActivity('user_relinked', `User ${user.name} re-linked account profile (${user.email})`, user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Account re-linked.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Register new user
    const targetRole = role || 'buyer';
    if (!['artist', 'buyer'].includes(targetRole)) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }

    // Generate a secure random password for DB requirements
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + 'A1!';

    user = await User.create({
      name,
      email,
      password: randomPassword,
      role: targetRole,
      isVerifiedArtist: false
    });

    // Log event
    await logActivity('user_registered', `User ${user.name} registered via Firebase as ${user.role} (${user.email})`, user._id);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification email sent. Please check your inbox.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if email exists in database
// @route   GET /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }
    
    const dbUser = await User.findOne({ email });
    let existsInFirebase = false;

    if (dbUser) {
      try {
        const firebaseUser = await getAuth().getUserByEmail(email);
        existsInFirebase = !!firebaseUser;
      } catch (firebaseErr) {
        if (firebaseErr.code === 'auth/user-not-found') {
          existsInFirebase = false;
        } else {
          console.error('Firebase Admin check error:', firebaseErr.message);
          existsInFirebase = true; // default fallback
        }
      }
    }

    res.status(200).json({
      success: true,
      exists: !!dbUser,
      existsInFirebase
    });
  } catch (err) {
    next(err);
  }
};
