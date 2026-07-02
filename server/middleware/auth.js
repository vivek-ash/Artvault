const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

// Protect routes — verify JWT from httpOnly cookie
exports.protect = async (req, res, next) => {
  let token;

  // Read token from httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Fallback: check Authorization header (for API testing tools like Postman)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (req.user.isSuspended) {
      return next(new ErrorResponse('Your account has been suspended', 403));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Authorize by role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};
