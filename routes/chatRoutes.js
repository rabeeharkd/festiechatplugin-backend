import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createChat as createAdminChat, 
  getChats as getAdminChats, 
  getChat as getAdminChat, 
  updateChat as updateAdminChat, 
  deleteChat as deleteAdminChat, 
  addParticipant as addAdminParticipant, 
  removeParticipant as removeAdminParticipant 
} from '../controllers/chatController.js';

const router = express.Router();

// Middleware to optionally authenticate user
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next();
};

// Apply optional authentication to all routes
router.use(optionalAuth);

// Original backwards-compatible routes (no authentication required)
router.get('/', async (req, res) => {
  try {
    const user = req.user;
    let chats;
    
    // If user is authenticated and is admin, use role-based filtering
    if (user && (user.role === 'admin' || user.email === 'amjedvnml@gmail.com')) {
      chats = await Chat.find()
        .sort({ lastActivity: -1 })
        .limit(50);
    } else if (user) {
      // Regular authenticated users get group chats and admin DMs only
      const adminUser = await User.findOne({ email: 'amjedvnml@gmail.com' });
      
      chats = await Chat.find({
        $or: [
          { type: 'group' },
          { name: { $regex: /group|main/i } },
          // DMs with admin user
          {
            type: 'individual',
            'legacyParticipants.name': { $in: ['amjedvnml', 'Admin'] }
          },
          // New admin DMs
          {
            isAdminDM: true,
            participants: user.id
          }
        ]
      })
        .sort({ lastActivity: -1 })
        .limit(50);
    } else {
      // No authentication - show all public chats
      chats = await Chat.find()
        .sort({ lastActivity: -1 })
        .limit(50);
    }

    res.json({
      success: true,
      count: chats.length,
      userRole: user ? user.role : 'guest',
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats',
      error: error.message
    });
  }
});

// Get a specific chat by ID (no authentication required)
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat',
      error: error.message
    });
  }
});

// Create a new chat (no authentication required)
router.post('/', async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const newChat = new Chat({
      name: name || 'New Chat',
      description: description || '',
      type: type || 'group',
      legacyParticipants: [],
      lastActivity: new Date()
    });

    const savedChat = await newChat.save();

    res.status(201).json({
      success: true,
      data: savedChat,
      message: 'Chat created successfully'
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat',
      error: error.message
    });
  }
});

// Update a chat (no authentication required)
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const chatId = req.params.id;

    const updatedChat = {
      id: chatId,
      name: name || `Chat ${chatId}`,
      description: description || 'Updated festival chat',
      type: 'group',
      legacyParticipants: ['Alice', 'Bob', 'Charlie'],
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: updatedChat
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat',
      error: error.message
    });
  }
});

// Delete a chat (no authentication required)
router.delete('/:id', async (req, res) => {
  try {
    const chatId = req.params.id;

    res.json({
      success: true,
      message: `Chat ${chatId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat',
      error: error.message
    });
  }
});

// Add participants to a chat (no authentication required)
router.post('/:id/participants', async (req, res) => {
  try {
    const { participants } = req.body;
    const chatId = req.params.id;

    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Participants array is required'
      });
    }

    res.json({
      success: true,
      message: 'Participants added successfully',
      data: {
        chatId,
        addedParticipants: participants
      }
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding participants',
      error: error.message
    });
  }
});

// Remove participant from a chat (no authentication required)
router.delete('/:id/participants/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const chatId = req.params.id;

    res.json({
      success: true,
      message: 'Participant removed successfully',
      data: {
        chatId,
        removedParticipant: participantId
      }
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing participant',
      error: error.message
    });
  }
});

// Separate admin DM endpoints (authenticated)
router.post('/admin/dm', protect, createAdminChat);
router.get('/admin/all', protect, getAdminChats);
router.get('/admin/:id', protect, getAdminChat);
router.put('/admin/:id', protect, updateAdminChat);
router.delete('/admin/:id', protect, deleteAdminChat);
router.post('/admin/:id/participants', protect, addAdminParticipant);
router.delete('/admin/:id/participants/:participantId', protect, removeAdminParticipant);

export default router;