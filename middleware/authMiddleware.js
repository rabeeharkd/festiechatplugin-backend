const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// @desc    Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid authorization header format'
        });
      }
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);

      // Check if this is an access token (not refresh token)
      if (decoded.type === 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type. Access token required.'
        });
      }

      // Get user from database
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware'
    });
  }
};

// @desc    Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please authenticate first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// @desc    Optional auth - attach user if token is valid, but don't require it
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
      } catch (error) {
        // Invalid header format, continue without auth
        return next();
      }
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if this is an access token
      if (decoded.type === 'refresh') {
        return next();
      }

      // Get user from database
      const user = await User.findById(decoded.userId);
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }

      next();
    } catch (error) {
      // Token invalid or expired, continue without auth
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// @desc    Rate limiting middleware for auth endpoints

// @desc    Middleware to extract and validate refresh token
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Basic token format validation
    if (typeof refreshToken !== 'string' || refreshToken.split('.').length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refresh token format'
      });
    }

    // Add to request for use in controller
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    console.error('Refresh token validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating refresh token'
    });
  }
};

// @desc    Middleware to check if user owns resource or is admin
const checkResourceOwnership = (resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access any resource
      if (user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      if (resourceId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error checking resource ownership'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  validateRefreshToken,
  checkResourceOwnership
};