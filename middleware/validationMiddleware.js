import { validationResult, body } from 'express-validator'

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }))
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    })
  }
  
  next()
}

// User update validation
export const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  validate
]

// Event validation
export const validateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event title must be between 3 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Event description must be between 10 and 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Event category is required')
    .isIn(['music', 'dance', 'art', 'food', 'sports', 'cultural', 'workshop', 'competition', 'other'])
    .withMessage('Invalid event category'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future')
      }
      return true
    }),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date')
      }
      return true
    }),
  
  body('location')
    .notEmpty()
    .withMessage('Event location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Event location must be between 3 and 200 characters'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max participants must be between 1 and 10000'),
  
  validate
]

// Chat validation
export const validateChat = [
  body('name')
    .if(body('chatType').equals('group'))
    .notEmpty()
    .withMessage('Group chat name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Chat description cannot exceed 500 characters'),
  
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required')
    .custom((participants) => {
      if (participants.some(p => typeof p !== 'string' || p.length !== 24)) {
        throw new Error('Invalid participant ID format')
      }
      return true
    }),
  
  body('chatType')
    .optional()
    .isIn(['direct', 'group'])
    .withMessage('Chat type must be either direct or group'),
  
  validate
]

// Message validation
export const validateMessage = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'video', 'audio', 'document', 'location'])
    .withMessage('Invalid message type'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID'),
  
  validate
]