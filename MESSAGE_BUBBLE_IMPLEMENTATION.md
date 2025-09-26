# 📱 Message Bubble Positioning Implementation Guide

## Overview
This guide shows how to implement message bubble positioning where:
- **Right side**: Messages from the current logged-in user
- **Left side**: Messages from other users

The backend now provides all necessary data for proper positioning.

## 🔧 Backend Changes Made

### 1. Updated Message Model
```javascript
// models/Message.js - Now includes:
{
  sender: ObjectId (ref: 'User'),
  senderEmail: String,
  senderName: String,
  // ... other fields
}
```

### 2. Enhanced API Responses
```javascript
// GET /api/messages/:chatId response:
{
  "success": true,
  "currentUser": {
    "email": "user@example.com",
    "name": "User Name"
  },
  "data": [
    {
      "content": "Hello!",
      "senderEmail": "user@example.com",
      "senderName": "User Name",
      "isOwnMessage": true,
      "position": "right"
    }
  ]
}
```

### 3. Real-time Socket Events
```javascript
// Socket event: 'new_message'
{
  "message": { /* message object */ },
  "senderInfo": {
    "email": "sender@example.com",
    "name": "Sender Name",
    "id": "user_id"
  }
}
```

## 🎨 Frontend Implementation

### 1. React Component Structure

```jsx
// MessageBubble.jsx
import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  currentUserEmail, 
  isOwnMessage 
}) => {
  return (
    <div className={`message-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className={`message-bubble ${isOwnMessage ? 'bubble-right' : 'bubble-left'}`}>
        {/* Sender name (only for others' messages) */}
        {!isOwnMessage && (
          <div className="sender-name">
            {message.senderName}
          </div>
        )}
        
        {/* Message content */}
        <div className="message-content">
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div className="message-timestamp">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
```

### 2. Chat Container Component

```jsx
// ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const ChatContainer = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { user, token } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      socketRef.current = io('https://festiechatplugin-backend.onrender.com', {
        auth: { token }
      });

      // Join chat room
      socketRef.current.emit('join_chat', { chatId });

      // Listen for new messages
      socketRef.current.on('new_message', (data) => {
        const { message, senderInfo } = data;
        
        // Add positioning information based on current user
        const messageWithPosition = {
          ...message,
          isOwnMessage: senderInfo.email === user.email,
          position: senderInfo.email === user.email ? 'right' : 'left'
        };
        
        setMessages(prev => [...prev, messageWithPosition]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [chatId, user, token]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(
          `https://festiechatplugin-backend.onrender.com/api/messages/${chatId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        const data = await response.json();
        
        if (data.success) {
          setCurrentUser(data.currentUser);
          setMessages(data.data); // Already includes isOwnMessage and position
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (chatId && token) {
      loadMessages();
    }
  }, [chatId, token]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      // Send via REST API
      const response = await fetch(
        `https://festiechatplugin-backend.onrender.com/api/messages/${chatId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            content: newMessage,
            type: 'text'
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Also send via socket for real-time updates
        socketRef.current?.emit('send_message', {
          chatId,
          content: newMessage,
          messageType: 'text'
        });

        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages area */}
      <div className="messages-area">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserEmail={currentUser?.email}
            isOwnMessage={message.isOwnMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
```

### 3. CSS Styling for Message Positioning

```css
/* MessageBubble.css */
.message-container {
  display: flex;
  margin: 8px 0;
  padding: 0 16px;
}

/* Own message - align to right */
.message-container.own-message {
  justify-content: flex-end;
}

/* Other's message - align to left */
.message-container.other-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

/* Right-aligned bubble (own messages) */
.bubble-right {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

/* Left-aligned bubble (others' messages) */
.bubble-left {
  background: #f1f3f5;
  color: #333;
  border-bottom-left-radius: 4px;
  margin-right: auto;
}

.sender-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.7;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-timestamp {
  font-size: 11px;
  opacity: 0.6;
  text-align: right;
}

/* Chat container styles */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  background: #fafafa;
}

.message-input-form {
  display: flex;
  padding: 16px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 24px;
  margin-right: 12px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.send-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.send-button:hover {
  background: #0056b3;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .message-container {
    padding: 0 12px;
  }
}
```

### 4. Auth Context Hook

```jsx
// hooks/useAuth.js or context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(
            'https://festiechatplugin-backend.onrender.com/api/auth/verify',
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const data = await response.json();
          
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, remove it
            localStorage.removeItem('accessToken');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('accessToken');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        'https://festiechatplugin-backend.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setToken(data.accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', data.accessToken);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🚀 Quick Setup Steps

### 1. Install Required Packages
```bash
npm install socket.io-client
```

### 2. Wrap Your App with Auth Provider
```jsx
// App.js
import { AuthProvider } from './context/AuthContext';
import ChatContainer from './components/ChatContainer';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChatContainer chatId="your-chat-id" />
      </div>
    </AuthProvider>
  );
}
```

### 3. Test Credentials
Use these for testing:
- **Email**: `admin@festiechat.com`
- **Password**: `admin123`

## 🎯 Key Features Implemented

✅ **Right-side positioning** for current user's messages  
✅ **Left-side positioning** for other users' messages  
✅ **Real-time updates** via Socket.IO  
✅ **User authentication** integration  
✅ **Responsive design** for mobile/desktop  
✅ **Sender name display** for other users  
✅ **Message timestamps**  
✅ **Auto-scroll** to latest messages  

## 🔄 Message Flow

1. **Loading Messages**: API call includes `isOwnMessage` and `position` for each message
2. **Sending Messages**: Marked as `position: 'right'` for sender
3. **Receiving Messages**: Socket events include sender info for positioning
4. **Real-time Updates**: Frontend calculates position based on current user vs sender email

## 🎨 Customization Options

### Different Bubble Styles
```css
/* iOS-style bubbles */
.bubble-right {
  background: #007aff;
  border-radius: 18px 18px 4px 18px;
}

.bubble-left {
  background: #e5e5ea;
  border-radius: 18px 18px 18px 4px;
}

/* Material Design style */
.bubble-right {
  background: #1976d2;
  border-radius: 16px 16px 4px 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

### Custom Colors Based on Sender
```jsx
const getSenderColor = (senderEmail) => {
  // Generate consistent color based on email
  const hash = senderEmail.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
};
```

This implementation provides a complete WhatsApp/iMessage-style chat interface with proper message bubble positioning! 🎉