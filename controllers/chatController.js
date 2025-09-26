const Chat = require('../models/Chat.js');
const User = require('../models/User.js');
const Message = require('../models/Message.js');

// @desc    Create new chat (including admin DMs)
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  try {
    const { name, type, participants, isAdminDM, description } = req.body;
    const userId = req.user.id;

    // For admin DMs, ensure admin is included in participants
    let chatParticipants = participants || [userId];
    
    if (isAdminDM) {
      const adminEmail = 'amjedvnml@gmail.com';
      const adminUser = await User.findOne({ email: adminEmail });
      
      if (adminUser && !chatParticipants.includes(adminUser._id.toString())) {
        chatParticipants.push(adminUser._id);
      }
      
      // Check if admin DM already exists for this user
      const existingAdminDM = await Chat.findOne({
        isAdminDM: true,
        participants: { $all: chatParticipants, $size: 2 }
      });
      
      if (existingAdminDM) {
        return res.status(200).json({
          success: true,
          message: 'Admin DM already exists',
          data: existingAdminDM
        });
      }
    }

    const newChat = new Chat({
      name,
      type: type || 'group',
      participants: chatParticipants,
      isAdminDM: isAdminDM || false,
      description,
      createdBy: userId
    });

    await newChat.save();
    await newChat.populate('participants', 'name email role');

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
};

// @desc    Get user's chats with role-based filtering
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    let chatQuery = { participants: userId };

    // Admin sees all chats
    if (userRole === 'admin' || userEmail === 'amjedvnml@gmail.com') {
      chatQuery = {}; // Admin sees all chats
    }

    const chats = await Chat.find(chatQuery)
      .populate('participants', 'name email role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // For regular users, filter to show only:
    // 1. Group chats
    // 2. Their own admin DM
    let filteredChats = chats;
    
    if (userRole !== 'admin' && userEmail !== 'amjedvnml@gmail.com') {
      filteredChats = chats.filter(chat => {
        const isGroupChat = chat.type === 'group' || chat.name.toLowerCase().includes('group');
        const isOwnAdminDM = chat.isAdminDM && chat.participants.some(p => p._id.toString() === userId);
        return isGroupChat || isOwnAdminDM;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredChats.length,
      userRole: userRole,
      data: filteredChats
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};

// @desc    Get single chat
// @route   GET /api/chats/:id
// @access  Private
const getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    const chat = await Chat.findById(id)
      .populate('participants', 'name email role')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check access permissions
    const isParticipant = chat.participants.some(p => p._id.toString() === userId);
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    res.status(200).json({
      success: true,
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
};

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private
const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is admin of chat or system admin
    const isSystemAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';
    const isChatCreator = chat.createdBy.toString() === userId;

    if (!isSystemAdmin && !isChatCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this chat'
      });
    }

    // Update fields
    if (name) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (type) chat.type = type;

    await chat.save();
    await chat.populate('participants', 'name email role');

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
};

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is admin of chat or system admin
    const isSystemAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';
    const isChatCreator = chat.createdBy.toString() === userId;

    if (!isSystemAdmin && !isChatCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    // Delete associated messages
    await Message.deleteMany({ chatId: id });

    // Delete the chat
    await Chat.findByIdAndDelete(id);

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
};

// @desc    Add participant to chat
// @route   POST /api/chats/:id/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: participantId } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    const isSystemAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';
    const isChatCreator = chat.createdBy.toString() === userId;

    if (!isSystemAdmin && !isChatCreator && !chat.isAdminDM) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add participants'
      });
    }

    // Check if user already exists
    if (chat.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    chat.participants.push(participantId);
    await chat.save();
    await chat.populate('participants', 'name email role');

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
};

// @desc    Remove participant from chat
// @route   DELETE /api/chats/:id/participants/:participantId
// @access  Private
const removeParticipant = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check permissions
    const isSystemAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';
    const isChatCreator = chat.createdBy.toString() === userId;
    const isLeavingSelf = participantId === userId;

    if (!isSystemAdmin && !isChatCreator && !isLeavingSelf) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove participants'
      });
    }

    chat.participants = chat.participants.filter(p => p.toString() !== participantId);
    await chat.save();
    await chat.populate('participants', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully',
      data: chat
    });

  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};

module.exports = {
  createChat,
  getChats,
  getChat,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant
};