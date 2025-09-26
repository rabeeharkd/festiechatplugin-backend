import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get active user count
// @route   GET /api/users/active-count
// @access  Private
router.get('/active-count', protect, async (req, res) => {
  try {
    // Count users active in last 24 hours
    const activeUserCount = await User.countDocuments({
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({ 
      success: true, 
      count: activeUserCount,
      timeframe: '24 hours'
    });
  } catch (error) {
    console.error('Error getting active user count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active user count',
      error: error.message
    });
  }
});

// @desc    Get current online users (for real-time count)
// @route   GET /api/users/online-count
// @access  Private
router.get('/online-count', protect, async (req, res) => {
  try {
    // Count users active in last 5 minutes (more real-time)
    const onlineUserCount = await User.countDocuments({
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    
    res.json({ 
      success: true, 
      count: onlineUserCount,
      timeframe: '5 minutes'
    });
  } catch (error) {
    console.error('Error getting online user count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching online user count',
      error: error.message
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users/all
// @access  Private (Admin)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.email !== 'amjedvnml@gmail.com') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

router.get('/all', protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
});

export default router;