import rateLimit from 'express-rate-limit';

// Create rate limit with admin bypass
const createRateLimit = (maxRequests, windowMinutes = 15, message = 'Too many requests') => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    message: {
      success: false,
      message,
      retryAfter: windowMinutes * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for admin users
    skip: (req) => {
      return req.user?.role === 'admin' || req.user?.email === 'amjedvnml@gmail.com';
    },
    // Custom key generator to include user ID if available
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    }
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(50, 15, 'Too many authentication attempts');
export const messageRateLimit = createRateLimit(200, 15, 'Too many messages sent');
export const chatRateLimit = createRateLimit(100, 15, 'Too many chat requests');
export const generalRateLimit = createRateLimit(300, 15, 'Too many requests');

// Strict rate limit for sensitive operations
export const strictRateLimit = createRateLimit(10, 15, 'Too many sensitive operations');

// Very permissive for admin operations
export const adminRateLimit = createRateLimit(1000, 15, 'Admin rate limit exceeded');

export default {
  createRateLimit,
  authRateLimit,
  messageRateLimit,
  chatRateLimit,
  generalRateLimit,
  strictRateLimit,
  adminRateLimit
};