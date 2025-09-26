// Admin access control middleware

// Require admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'admin' && req.user.email !== 'amjedvnml@gmail.com') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  
  next();
};

// Track user activity middleware
export const trackActivity = async (req, res, next) => {
  if (req.user) {
    try {
      // Import User model dynamically to avoid circular dependency
      const { default: User } = await import('../models/User.js');
      
      // Update user activity in background (don't wait)
      User.findByIdAndUpdate(req.user._id, { 
        lastActive: new Date(),
        isActive: true 
      }).exec().catch(err => {
        console.error('Error updating user activity:', err);
      });
    } catch (error) {
      console.error('Error in activity tracking:', error);
    }
  }
  next();
};

// Optional admin or owner access
export const requireAdminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  const isAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';
  const isOwner = req.params.userId === req.user._id.toString();
  
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access or resource ownership required' 
    });
  }
  
  next();
};

export default {
  requireAdmin,
  trackActivity,
  requireAdminOrOwner
};