const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

// Validation middleware
const chatValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Chat name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('type')
    .isIn(['group', 'dm', 'channel'])
    .withMessage('Type must be group, dm, or channel'),
  body('category')
    .optional()
    .isIn(['general', 'work', 'social', 'support', 'announcements'])
    .withMessage('Invalid category')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/chats
// @desc    Get all active chats - accessible to all logged-in users
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // All logged-in users can see all active chats
    const chatQuery = { isActive: true };

    const chats = await Chat.find(chatQuery)
      .populate('participants.user', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('lastMessage.sender', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      userRole: userRole,
      message: 'All chats accessible to logged-in users',
      data: chats
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// @route   POST /api/chats
// @desc    Create new chat (including admin DMs)
// @access  Private
router.post("/", protect, chatValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, type, participants = [], isAdminDM, category, avatar, settings } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // For admin DMs, ensure admin is included in participants
    let chatParticipants = [...participants];
    
    if (isAdminDM) {
      const adminEmail = 'amjedvnml@gmail.com';
      const adminUser = await User.findOne({ email: adminEmail });
      
      if (adminUser && !chatParticipants.includes(adminUser._id.toString())) {
        chatParticipants.push(adminUser._id);
      }
      
      // Check if admin DM already exists for this user
      const existingAdminDM = await Chat.findOne({
        isAdminDM: true,
        type: 'dm',
        $and: [
          { 'participants.user': userId },
          { 'participants.user': adminUser._id }
        ],
        isActive: true
      });
      
      if (existingAdminDM) {
        return res.status(200).json({
          success: true,
          message: 'Admin DM already exists',
          data: existingAdminDM
        });
      }
    }

    // Create the chat
    const newChat = new Chat({
      name,
      description,
      type: type || 'group',
      category: category || 'general',
      avatar,
      createdBy: userId,
      isAdminDM: isAdminDM || false,
      settings: settings || {}
    });

    // Add creator as admin participant
    newChat.addParticipant(userId, userName, 'admin');

    // Add other participants
    for (const participantId of chatParticipants) {
      if (participantId !== userId.toString()) {
        const participant = await User.findById(participantId);
        if (participant) {
          const role = isAdminDM && participant.email === 'amjedvnml@gmail.com' ? 'admin' : 'member';
          newChat.addParticipant(participant._id, participant.name, role);
        }
      }
    }

    await newChat.save();
    
    // Populate the response
    await newChat.populate([
      { path: 'participants.user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: newChat
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
});

// @route   GET /api/chats/:id
// @desc    Get single chat - accessible to all logged-in users
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id)
      .populate('participants.user', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('lastMessage.sender', 'name email');

    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // All logged-in users can access any chat
    res.status(200).json({
      success: true,
      message: 'Chat accessible to all logged-in users',
      data: chat
    });

  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
});

// @route   PUT /api/chats/:id
// @desc    Update chat
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar, settings } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // All logged-in users can update chats

    // Update fields
    if (name) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (avatar !== undefined) chat.avatar = avatar;
    if (settings) chat.settings = { ...chat.settings.toObject(), ...settings };

    await chat.save();
    await chat.populate([
      { path: 'participants.user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Chat updated successfully',
      data: chat
    });

  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat',
      error: error.message
    });
  }
});

// @route   DELETE /api/chats/:id
// @desc    Delete chat (soft delete)
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // All logged-in users can delete chats

    // Soft delete
    chat.isActive = false;
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

// @route   POST /api/chats/:id/participants
// @desc    Add participant to chat
// @access  Private
router.post("/:id/participants", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: participantId, role = 'member' } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // All logged-in users can add participants to chats

    // Check if user already exists
    if (chat.isParticipant(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    // Add participant
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    chat.addParticipant(participant._id, participant.name, role);
    await chat.save();
    await chat.populate('participants.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      data: chat
    });

  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
});

module.exports = router;
