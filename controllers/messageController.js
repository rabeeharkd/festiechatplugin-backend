import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Send message with admin DM support
// @route   POST /api/messages/:chatId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType, sender } = req.body;
    const userId = req.user.id;

    // Validate chat exists and user has access
    const chat = await Chat.findById(chatId).populate('participants');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant in the chat
    const isParticipant = chat.participants.some(p => p._id.toString() === userId);
    const isAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const newMessage = new Message({
      content,
      sender: sender || req.user.name || req.user.email,
      senderId: userId,
      chatId,
      messageType: messageType || 'text',
      timestamp: new Date()
    });

    await newMessage.save();

    // Update chat's last message
    chat.lastMessage = newMessage._id;
    chat.updatedAt = new Date();
    // Ensure createdBy is set (for legacy chats)
    if (!chat.createdBy) {
      chat.createdBy = userId;
    }
    await chat.save();

    // Populate sender info for response
    await newMessage.populate('senderId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get messages with DM privacy filtering
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;
    const { page = 1, limit = 50 } = req.query;

    // Validate chat access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has access to this chat
    const isParticipant = chat.participants.some(p => p.toString() === userId);
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const skip = (page - 1) * limit;

    let messages = await Message.find({ chatId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'name email role');

    // Apply DM privacy filtering for regular users
    if (chat.isAdminDM && userRole !== 'admin' && userEmail !== 'amjedvnml@gmail.com') {
      messages = messages.filter(msg => {
        const isOwnMessage = msg.senderId && msg.senderId._id.toString() === userId;
        const isAdminMessage = msg.senderId && 
          (msg.senderId.role === 'admin' || msg.senderId.email === 'amjedvnml@gmail.com');
        return isOwnMessage || isAdminMessage;
      });
    }

    // Reverse to show oldest first
    messages.reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      page: parseInt(page),
      data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Get single message
// @route   GET /api/messages/message/:id
// @access  Private
export const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    const message = await Message.findById(id).populate('senderId', 'name email role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check chat access
    const chat = await Chat.findById(message.chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(p => p.toString() === userId);
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this message'
      });
    }

    // Apply DM privacy filtering
    if (chat.isAdminDM && userRole !== 'admin' && userEmail !== 'amjedvnml@gmail.com') {
      const isOwnMessage = message.senderId && message.senderId._id.toString() === userId;
      const isAdminMessage = message.senderId && 
        (message.senderId.role === 'admin' || message.senderId.email === 'amjedvnml@gmail.com');
      
      if (!isOwnMessage && !isAdminMessage) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this message'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// @desc    Update message
// @route   PUT /api/messages/message/:id
// @access  Private
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or admin can update message
    const isOwner = message.senderId.toString() === userId;
    const isAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('senderId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/message/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or admin can delete message
    const isOwner = message.senderId.toString() === userId;
    const isAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:chatId/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Validate chat access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(p => p.toString() === userId);
    const isAdmin = req.user.role === 'admin' || req.user.email === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Mark messages as read for this user
    await Message.updateMany(
      { 
        chatId,
        senderId: { $ne: userId },
        isRead: false
      },
      { 
        $set: { isRead: true },
        $addToSet: { readBy: userId }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// @desc    Search messages in chat
// @route   GET /api/messages/:chatId/search
// @access  Private
export const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q, limit = 20 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Validate chat access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(p => p.toString() === userId);
    const isAdmin = userRole === 'admin' || userEmail === 'amjedvnml@gmail.com';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    let messages = await Message.find({
      chatId,
      content: { $regex: q, $options: 'i' }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('senderId', 'name email role');

    // Apply DM privacy filtering for regular users
    if (chat.isAdminDM && userRole !== 'admin' && userEmail !== 'amjedvnml@gmail.com') {
      messages = messages.filter(msg => {
        const isOwnMessage = msg.senderId && msg.senderId._id.toString() === userId;
        const isAdminMessage = msg.senderId && 
          (msg.senderId.role === 'admin' || msg.senderId.email === 'amjedvnml@gmail.com');
        return isOwnMessage || isAdminMessage;
      });
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      query: q,
      data: messages
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
};