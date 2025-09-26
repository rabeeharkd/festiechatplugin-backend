import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Store connected users
const connectedUsers = new Map();

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      isOnline: true,
      lastSeen: new Date()
    });

    // Broadcast user online status to all contacts
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

    // Join user-specific room for direct notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining a chat
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Get user info
        const user = await User.findById(socket.userId);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Verify user is a participant in this chat or is admin
        const chat = await Chat.findById(chatId).populate('participants');
        const isParticipant = chat && chat.participants.some(p => p._id.toString() === socket.userId);
        const isAdmin = user.role === 'admin' || user.email === 'amjedvnml@gmail.com';

        if (!chat || (!isParticipant && !isAdmin)) {
          socket.emit('error', { message: 'Unauthorized to join this chat' });
          return;
        }

        // Join the chat room
        socket.join(`chat_${chatId}`);
        
        // Update user's last seen in this chat
        await Chat.findByIdAndUpdate(chatId, {
          $set: {
            [`lastSeen.${socket.userId}`]: new Date()
          }
        });

        // Notify other participants that user joined
        socket.to(`chat_${chatId}`).emit('user_joined_chat', {
          userId: socket.userId,
          chatId: chatId
        });

        socket.emit('joined_chat', { chatId });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving a chat
    socket.on('leave_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Leave the chat room
        socket.leave(`chat_${chatId}`);
        
        // Update user's last seen in this chat
        await Chat.findByIdAndUpdate(chatId, {
          $set: {
            [`lastSeen.${socket.userId}`]: new Date()
          }
        });

        // Notify other participants that user left
        socket.to(`chat_${chatId}`).emit('user_left_chat', {
          userId: socket.userId,
          chatId: chatId
        });

        socket.emit('left_chat', { chatId });
      } catch (error) {
        console.error('Error leaving chat:', error);
        socket.emit('error', { message: 'Failed to leave chat' });
      }
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', replyTo, attachments, sender, senderEmail, senderName } = data;
        
        // For backwards compatibility, allow messages without authentication
        let senderInfo = {
          id: socket.userId || null,
          name: senderName || sender || 'Anonymous',
          email: senderEmail || null
        };
        
        // Try to get user info if userId is available
        if (socket.userId) {
          try {
            const currentUser = await User.findById(socket.userId);
            if (currentUser) {
              senderInfo = {
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role
              };
            }
          } catch (error) {
            // Continue without user info if authentication fails
            console.log('Could not fetch user info, continuing without authentication');
          }
        }
        
        // Check if chat exists and get admin DM info
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // For admin DMs, check access permissions
        if (chat.isAdminDM && socket.userId) {
          const isParticipant = chat.participants.some(p => p._id.toString() === socket.userId);
          const isAdmin = senderInfo.role === 'admin' || senderInfo.email === 'amjedvnml@gmail.com';
          
          if (!isParticipant && !isAdmin) {
            socket.emit('error', { message: 'Access denied to this admin DM' });
            return;
          }
        }

        // Create the message with flexible sender support
        const messageData = {
          sender: senderInfo.id || senderInfo.name, // Use ID if available, otherwise name
          senderId: senderInfo.id,
          chatId: chatId,
          content,
          messageType: messageType,
          replyTo,
          attachments: attachments || [],
          timestamp: new Date()
        };
        
        // Add email and name if available
        if (senderInfo.email) messageData.senderEmail = senderInfo.email;
        if (senderInfo.name) messageData.senderName = senderInfo.name;

        const message = new Message(messageData);
        await message.save();
        
        // Try to populate sender if it's an ObjectId
        if (message.senderId) {
          await message.populate('senderId', 'name email role');
        }

        // Add positioning information
        const messageWithPosition = {
          ...message.toObject(),
          isOwnMessage: true, // Always true for sender
          position: 'right' // Always right for sender
        };

        // Update chat's last message and activity
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastActivity: new Date(),
          $inc: { messageCount: 1 }
        });

        // For admin DMs, emit to specific participants only
        if (chat.isAdminDM) {
          // Emit to all participants in the admin DM
          chat.participants.forEach(participant => {
            io.to(`user_${participant._id}`).emit('new_message', {
              message: message,
              chatId: chatId,
              senderInfo: {
                email: senderInfo.email,
                name: senderInfo.name,
                id: senderInfo.id,
                role: senderInfo.role
              },
              isAdminDM: true
            });
          });

          // Also emit to admin if not already included
          const adminUser = await User.findOne({ email: 'amjedvnml@gmail.com' });
          if (adminUser && !chat.participants.some(p => p._id.toString() === adminUser._id.toString())) {
            io.to(`user_${adminUser._id}`).emit('new_message', {
              message: message,
              chatId: chatId,
              senderInfo: {
                email: senderInfo.email,
                name: senderInfo.name,
                id: senderInfo.id,
                role: senderInfo.role
              },
              isAdminDM: true
            });
          }
        } else {
          // Emit message to all participants in regular chats
          io.to(`chat_${chatId}`).emit('new_message', {
            message: message,
            chatId: chatId,
            senderInfo: {
              email: senderInfo.email,
              name: senderInfo.name,
              id: senderInfo.id,
              role: senderInfo.role
            }
          });
        }

        // Send push notifications to offline users
        const offlineParticipants = chat.participants.filter(p => 
          p._id.toString() !== socket.userId && 
          !connectedUsers.has(p._id.toString())
        );

        // Here you would integrate with push notification service
        // for offline participants

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reactions
    socket.on('react_to_message', async (data) => {
      try {
        const { messageId, reaction } = data;
        
        const message = await Message.findById(messageId).populate('chat');
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Verify user is a participant in the chat
        const chat = await Chat.findById(message.chat._id).populate('participants');
        if (!chat || !chat.participants.some(p => p._id.toString() === socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to react to this message' });
          return;
        }

        // Check if user already reacted with this reaction
        const existingReactionIndex = message.reactions.findIndex(r => 
          r.user.toString() === socket.userId && r.reaction === reaction
        );

        if (existingReactionIndex > -1) {
          // Remove existing reaction
          message.reactions.splice(existingReactionIndex, 1);
        } else {
          // Add new reaction
          message.reactions.push({
            user: socket.userId,
            reaction: reaction
          });
        }

        await message.save();
        await message.populate(['reactions.user']);

        // Emit reaction update to all participants in the chat
        io.to(`chat_${message.chat._id}`).emit('message_reaction_updated', {
          messageId: messageId,
          reactions: message.reactions
        });

      } catch (error) {
        console.error('Error reacting to message:', error);
        socket.emit('error', { message: 'Failed to react to message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId: chatId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId: chatId,
        isTyping: false
      });
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId, messageIds } = data;
        
        // Verify user is a participant in this chat
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat || !chat.participants.some(p => p._id.toString() === socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to mark messages as read' });
          return;
        }

        // Update read status for messages
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            chat: chatId,
            sender: { $ne: socket.userId }
          },
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Update user's last seen in chat
        await Chat.findByIdAndUpdate(chatId, {
          $set: {
            [`lastSeen.${socket.userId}`]: new Date()
          }
        });

        // Notify other participants about read status
        socket.to(`chat_${chatId}`).emit('messages_read', {
          userId: socket.userId,
          messageIds: messageIds,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle message forwarding (Instagram-style)
    socket.on('forward_message', async (data) => {
      try {
        const { messageId, targetChatIds, comment } = data;
        
        // Get the original message
        const originalMessage = await Message.findById(messageId)
          .populate(['sender', 'chat', 'replyTo']);
        
        if (!originalMessage) {
          socket.emit('error', { message: 'Original message not found' });
          return;
        }

        // Verify user has access to the original message
        const originalChat = await Chat.findById(originalMessage.chat._id).populate('participants');
        if (!originalChat || !originalChat.participants.some(p => p._id.toString() === socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to forward this message' });
          return;
        }

        const forwardedMessages = [];

        // Forward to each target chat
        for (const targetChatId of targetChatIds) {
          // Verify user is a participant in target chat
          const targetChat = await Chat.findById(targetChatId).populate('participants');
          if (!targetChat || !targetChat.participants.some(p => p._id.toString() === socket.userId)) {
            continue; // Skip unauthorized chats
          }

          // Create forwarded message
          const forwardedMessage = new Message({
            sender: socket.userId,
            chat: targetChatId,
            content: originalMessage.content,
            messageType: originalMessage.messageType,
            attachments: originalMessage.attachments,
            forwardedFrom: {
              originalMessage: originalMessage._id,
              originalSender: originalMessage.sender._id,
              originalChat: originalMessage.chat._id
            }
          });

          await forwardedMessage.save();
          await forwardedMessage.populate(['sender', 'forwardedFrom.originalSender']);

          // If there's a comment, send it as a separate message
          if (comment && comment.trim()) {
            const commentMessage = new Message({
              sender: socket.userId,
              chat: targetChatId,
              content: comment.trim(),
              messageType: 'text'
            });

            await commentMessage.save();
            await commentMessage.populate('sender');

            // Emit comment message
            io.to(`chat_${targetChatId}`).emit('new_message', {
              message: commentMessage,
              chatId: targetChatId
            });
          }

          // Update target chat's last message and activity
          await Chat.findByIdAndUpdate(targetChatId, {
            lastMessage: forwardedMessage._id,
            lastActivity: new Date(),
            $inc: { messageCount: 1 }
          });

          forwardedMessages.push(forwardedMessage);

          // Emit forwarded message to target chat participants
          io.to(`chat_${targetChatId}`).emit('new_message', {
            message: forwardedMessage,
            chatId: targetChatId,
            isForwarded: true
          });
        }

        // Confirm successful forwarding to sender
        socket.emit('message_forwarded', {
          originalMessageId: messageId,
          forwardedToChats: targetChatIds,
          forwardedMessages: forwardedMessages
        });

      } catch (error) {
        console.error('Error forwarding message:', error);
        socket.emit('error', { message: 'Failed to forward message' });
      }
    });

    // Handle getting online users
    socket.on('get_online_users', () => {
      const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
        userId: user.userId,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }));
      
      socket.emit('online_users', onlineUsers);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Update user's offline status
      if (connectedUsers.has(socket.userId)) {
        connectedUsers.delete(socket.userId);
        
        // Update user's last seen in database
        await User.findByIdAndUpdate(socket.userId, {
          lastSeen: new Date(),
          isOnline: false
        });

        // Broadcast user offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'Socket connection error' });
    });
  });
}