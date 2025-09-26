const express = require('express');
const Message = require('../models/Message.js');
const Chat = require('../models/Chat.js');
const User = require('../models/User.js');
const { protect } = require('../middleware/authMiddleware.js');
const {
  sendMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  markMessagesAsRead,
  searchMessages
} = require('../controllers/messageController.js');

const router = express.Router();

// Original backwards-compatible routes (no authentication required)
// Get all messages for a specific chat
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, userEmail } = req.query; // Optional user email for positioning

    const messages = await Message.find({ 
      $or: [
        { chat: chatId },
        { chatId: chatId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email role'); // Use the correct field name from your schema

    // Add positioning information for each message
    const messagesWithPosition = messages.reverse().map(message => {
      let isOwnMessage = false;
      let senderInfo = {
        name: message.senderName || message.sender,
        email: message.senderEmail || null
      };
      
      // Determine if this is the current user's message
      if (userEmail && message.senderEmail) {
        isOwnMessage = message.senderEmail === userEmail;
      }
      
      return {
        ...message.toObject(),
        senderInfo,
        isOwnMessage,
        position: isOwnMessage ? 'right' : 'left'
      };
    });

    res.json({
      success: true,
      count: messagesWithPosition.length,
      currentUser: userEmail ? { email: userEmail } : null,
      data: messagesWithPosition
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }
});

// Send a new message (no authentication required)
router.post('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', sender, senderEmail, senderName } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (!sender) {
      return res.status(400).json({
        success: false,
        message: 'Sender is required'
      });
    }

    let chat;
    
    // Handle admin DM format: admin-dm-{userId}
    if (chatId.startsWith('admin-dm-')) {
      const userId = chatId.replace('admin-dm-', '');
      
      // Find existing admin DM or create one
      chat = await Chat.findOne({
        isAdminDM: true,
        participants: { $all: [userId] }
      });
      
      if (!chat) {
        // Create admin DM if it doesn't exist
        const adminUser = await User.findOne({ email: 'amjedvnml@gmail.com' });
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        
        const participants = [userId];
        if (adminUser && !participants.includes(adminUser._id.toString())) {
          participants.push(adminUser._id);
        }
        
        chat = new Chat({
          name: 'Admin',
          type: 'dm',
          isAdminDM: true,
          participants: participants,
          description: 'Direct message with admin',
          createdBy: userId,
          lastActivity: new Date()
        });
        
        await chat.save();
      }
    } else {
      // Regular chat lookup
      chat = await Chat.findById(chatId);
    }
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Create new message with flexible sender support
    const messageData = {
      chatId: chat._id, // Use actual chat ObjectId
      chat: chat._id, // For backwards compatibility
      sender, // Can be string or ObjectId
      content,
      messageType: type,
      timestamp: new Date()
    };
    
    // Add email and name if provided
    if (senderEmail) messageData.senderEmail = senderEmail;
    if (senderName) messageData.senderName = senderName;

    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();
    
    // Try to populate sender if it's an ObjectId, ignore if it's a string
    if (savedMessage.sender) {
      await savedMessage.populate('sender', 'name email'); // Use the correct field name from your schema
    }

    // Update chat's last message and activity
    if (chat.legacyLastMessage !== undefined) {
      chat.legacyLastMessage = {
        content,
        sender: senderName || sender, // Use provided name or fallback to sender
        timestamp: new Date()
      };
    }
    chat.lastActivity = new Date();
    await chat.save();

    // Add positioning information to response
    const messageWithPosition = {
      ...savedMessage.toObject(),
      isOwnMessage: senderEmail ? true : false, // Can't determine without user context
      position: senderEmail ? 'right' : 'left',
      senderInfo: {
        name: senderName || sender,
        email: senderEmail || null
      }
    };

    // Emit to socket clients
    if (req.io) {
      req.io.to(`chat_${chat._id}`).emit('new_message', {
        message: savedMessage,
        chatId: chat._id,
        senderInfo: {
          email: senderEmail,
          name: senderName || sender
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithPosition
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
});

// Delete a message (no authentication required)
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message',
      error: error.message
    });
  }
});

// Admin DM routes (authenticated)
router.post('/admin/:chatId', protect, sendMessage);
router.get('/admin/:chatId', protect, getMessages);
router.get('/admin/message/:id', protect, getMessage);
router.put('/admin/message/:id', protect, updateMessage);
router.delete('/admin/message/:id', protect, deleteMessage);
router.put('/admin/:chatId/read', protect, markMessagesAsRead);
router.get('/admin/:chatId/search', protect, searchMessages);

module.exports = router;