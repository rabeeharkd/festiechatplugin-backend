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

    // All logged-in users can access any chat - Open Access Policy v2
    res.status(200).json({
      success: true,
      message: 'Chat accessible to all logged-in users - Open Access Policy Active',
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

// @route   POST /api/chats/:id/join
// @desc    Allow user to join an existing chat by ID (self-join)
// @access  Private
router.post("/:id/join", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userName = req.user.name;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is already a participant
    if (chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this chat',
        data: chat
      });
    }

    // Add current user as participant
    chat.addParticipant(userId, userName, 'member');
    await chat.save();
    
    // Populate the response
    await chat.populate([
      { path: 'participants.user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Successfully joined the chat!',
      data: chat
    });

  } catch (error) {
    console.error('Error joining chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join chat',
      error: error.message
    });
  }
});

// @route   POST /api/chats/join-by-name
// @desc    Allow user to join an existing chat by name (user-friendly)
// @access  Private
router.post("/join-by-name", protect, async (req, res) => {
  try {
    const { chatName } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!chatName || typeof chatName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Chat name is required'
      });
    }

    // Find chat by name (case-insensitive)
    const chat = await Chat.findOne({
      name: { $regex: new RegExp(`^${chatName.trim()}$`, 'i') },
      isActive: true
    });

    if (!chat) {
      // Also search for partial matches to help users
      const similarChats = await Chat.find({
        name: { $regex: new RegExp(chatName.trim(), 'i') },
        isActive: true
      }).select('name _id').limit(5);

      const suggestions = similarChats.length > 0 
        ? similarChats.map(c => c.name)
        : [];

      return res.status(404).json({
        success: false,
        message: `Chat "${chatName}" not found`,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        hint: 'Chat names are case-sensitive. Try checking the exact spelling.'
      });
    }

    // Check if user is already a participant
    if (chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: `You are already a member of "${chat.name}"`,
        data: chat
      });
    }

    // Add current user as participant
    chat.addParticipant(userId, userName, 'member');
    await chat.save();
    
    // Populate the response
    await chat.populate([
      { path: 'participants.user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully joined "${chat.name}"!`,
      data: chat
    });

  } catch (error) {
    console.error('Error joining chat by name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join chat',
      error: error.message
    });
  }
});

// @route   GET /api/chats/search-by-name
// @desc    Search for chats by name (to help users find chats to join)
// @access  Private
router.get("/search-by-name", protect, async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required (minimum 1 character)'
      });
    }

    // Search for chats by name (case-insensitive, partial match)
    const searchResults = await Chat.find({
      name: { $regex: new RegExp(q.trim(), 'i') },
      isActive: true
    })
    .select('name description type category participants createdBy createdAt')
    .populate('createdBy', 'name email')
    .limit(parseInt(limit))
    .sort({ name: 1 });

    // Add join status for each chat
    const resultsWithJoinStatus = searchResults.map(chat => {
      const isParticipant = chat.isParticipant(userId);
      const participantCount = chat.participants ? chat.participants.length : 0;

      return {
        _id: chat._id,
        name: chat.name,
        description: chat.description,
        type: chat.type,
        category: chat.category,
        createdBy: chat.createdBy,
        createdAt: chat.createdAt,
        participantCount: participantCount,
        isParticipant: isParticipant,
        canJoin: !isParticipant
      };
    });

    res.status(200).json({
      success: true,
      message: `Found ${resultsWithJoinStatus.length} chats matching "${q}"`,
      query: q,
      count: resultsWithJoinStatus.length,
      data: resultsWithJoinStatus
    });

  } catch (error) {
    console.error('Error searching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search chats',
      error: error.message
    });
  }
});

// @route   POST /api/chats/:id/leave
// @desc    Allow user to leave a chat
// @access  Private
router.post("/:id/leave", protect, async (req, res) => {
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

    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this chat'
      });
    }

    // Remove user from chat
    chat.removeParticipant(userId);
    await chat.save();
    
    // Populate the response
    await chat.populate([
      { path: 'participants.user', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Successfully left the chat',
      data: chat
    });

  } catch (error) {
    console.error('Error leaving chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat',
      error: error.message
    });
  }
});

// @route   POST /api/chats/bulk-create
// @desc    Create multiple groups at once (Admin only - Plus button functionality)
// @access  Private (Admin only)
router.post("/bulk-create", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Check if user is admin
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. Only admins can bulk create groups.'
      });
    }

    const { 
      count = 1, 
      namePrefix = 'Group', 
      description = 'Auto-created group',
      category = 'general',
      type = 'group'
    } = req.body;

    // Validate count
    if (count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 50 groups'
      });
    }

    const createdChats = [];
    const errors = [];

    // Create multiple groups
    for (let i = 1; i <= count; i++) {
      try {
        const chatName = `${namePrefix} ${i}`;
        
        const newChat = new Chat({
          name: chatName,
          description: `${description} (${i}/${count})`,
          type: type,
          category: category,
          createdBy: userId,
          isAdminDM: false,
          settings: {
            allowFileSharing: true,
            allowMediaSharing: true,
            allowParticipantMessages: true,
            isPublic: true,
            requireApproval: false,
            maxParticipants: 100
          }
        });

        // Add admin as participant
        newChat.addParticipant(userId, req.user.name, 'admin');
        
        await newChat.save();
        
        // Populate the response
        await newChat.populate([
          { path: 'participants.user', select: 'name email role' },
          { path: 'createdBy', select: 'name email role' }
        ]);

        createdChats.push(newChat);
        
      } catch (chatError) {
        errors.push({
          chatNumber: i,
          error: chatError.message
        });
      }
    }

    // Return results
    const successCount = createdChats.length;
    const errorCount = errors.length;

    res.status(201).json({
      success: true,
      message: `Bulk creation completed: ${successCount} groups created successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      summary: {
        requested: count,
        successful: successCount,
        failed: errorCount,
        namePrefix: namePrefix
      },
      data: createdChats,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in bulk chat creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create groups in bulk',
      error: error.message
    });
  }
});

// @route   POST /api/chats/quick-groups
// @desc    Quick create predefined groups (Admin only - Plus button presets)
// @access  Private (Admin only)
router.post("/quick-groups", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Check if user is admin
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. Only admins can create quick groups.'
      });
    }

    const { preset = 'default' } = req.body;

    // Define group presets
    const groupPresets = {
      default: [
        { name: 'General Discussion', description: 'Main group for general conversations', category: 'general' },
        { name: 'Announcements', description: 'Important updates and announcements', category: 'announcements' },
        { name: 'Social Chat', description: 'Casual social conversations', category: 'social' }
      ],
      work: [
        { name: 'Project Updates', description: 'Share project progress and updates', category: 'work' },
        { name: 'Team Discussion', description: 'Team coordination and planning', category: 'work' },
        { name: 'Support & Help', description: 'Get help and support from team', category: 'support' }
      ],
      event: [
        { name: 'Event Planning', description: 'Plan and organize events', category: 'general' },
        { name: 'Event Updates', description: 'Latest event information', category: 'announcements' },
        { name: 'Event Social', description: 'Social chat for event participants', category: 'social' }
      ],
      community: [
        { name: 'Welcome Newbies', description: 'Welcome new community members', category: 'general' },
        { name: 'Community News', description: 'Latest community updates', category: 'announcements' },
        { name: 'Help & Support', description: 'Community support and assistance', category: 'support' },
        { name: 'Off Topic', description: 'Fun and casual conversations', category: 'social' }
      ]
    };

    const selectedPreset = groupPresets[preset];
    if (!selectedPreset) {
      return res.status(400).json({
        success: false,
        message: `Invalid preset. Available presets: ${Object.keys(groupPresets).join(', ')}`
      });
    }

    const createdChats = [];
    const errors = [];

    // Create groups from preset
    for (let i = 0; i < selectedPreset.length; i++) {
      try {
        const groupData = selectedPreset[i];
        
        const newChat = new Chat({
          name: groupData.name,
          description: groupData.description,
          type: 'group',
          category: groupData.category,
          createdBy: userId,
          isAdminDM: false,
          settings: {
            allowFileSharing: true,
            allowMediaSharing: true,
            allowParticipantMessages: true,
            isPublic: true,
            requireApproval: false,
            maxParticipants: 100
          }
        });

        // Add admin as participant
        newChat.addParticipant(userId, req.user.name, 'admin');
        
        await newChat.save();
        
        // Populate the response
        await newChat.populate([
          { path: 'participants.user', select: 'name email role' },
          { path: 'createdBy', select: 'name email role' }
        ]);

        createdChats.push(newChat);
        
      } catch (chatError) {
        errors.push({
          groupName: selectedPreset[i].name,
          error: chatError.message
        });
      }
    }

    const successCount = createdChats.length;
    const errorCount = errors.length;

    res.status(201).json({
      success: true,
      message: `Quick groups created: ${successCount} groups from '${preset}' preset${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      preset: preset,
      summary: {
        preset: preset,
        successful: successCount,
        failed: errorCount
      },
      data: createdChats,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in quick group creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quick groups',
      error: error.message
    });
  }
});

module.exports = router;
