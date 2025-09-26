const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  changePassword,
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  updateProfile
} = require('../controllers/authController.js');
const {
  authorize,
  protect,
  validateRefreshToken
} = require('../middleware/authMiddleware.js');
const User = require('../models/User.js');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Public routes (no authentication required)

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  registerValidation,
  register
);

// Debug endpoint to test validation
router.post('/test-validation', 
  registerValidation,
  (req, res) => {
    const errors = validationResult(req);
    res.json({
      success: true,
      message: 'Validation test',
      body: req.body,
      hasErrors: !errors.isEmpty(),
      errors: errors.array()
    });
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  loginValidation,
  login
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh-token',
  validateRefreshToken,
  refreshToken
);

// Protected routes (authentication required)

// @route   POST /api/auth/logout
// @desc    Logout user (remove refresh token)
// @access  Private
router.post('/logout',
  protect,
  logout
);

// @route   POST /api/auth/logout-all
// @desc    Logout user from all devices
// @access  Private
router.post('/logout-all',
  protect,
  logoutAll
);

// @route   GET /api/auth/verify
// @desc    Verify JWT token and get current user
// @access  Private
router.get('/verify',
  protect,
  getMe
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me',
  protect,
  getMe
);

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me',
  protect,
  updateProfileValidation,
  updateProfile
);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  protect,
  changePasswordValidation,
  changePassword
);

// Admin routes (admin role required)

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const search = req.query.search;
      const role = req.query.role;
      const status = req.query.status;

      // Build query
      let query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role) {
        query.role = role;
      }
      
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching users'
      });
    }
  }
);

// @route   PUT /api/auth/users/:id/status
// @desc    Update user status (admin only)
// @access  Private/Admin
router.put('/users/:id/status',
  protect,
  authorize('admin'),
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],
  async (req, res) => {
    try {
      const { isActive } = req.body;
      const userId = req.params.id;

      // Prevent admin from deactivating themselves
      if (userId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
      ).select('-refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If deactivating, remove all refresh tokens
      if (!isActive) {
        await user.removeAllRefreshTokens();
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating user status'
      });
    }
  }
);

// @route   PUT /api/auth/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/users/:id/role',
  protect,
  authorize('admin'),
  [
    body('role')
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Role must be user, admin, or moderator')
  ],
  async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select('-refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating user role'
      });
    }
  }
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;