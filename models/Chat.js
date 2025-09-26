const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "member", "moderator"], 
    default: "member" 
  },
  joinedAt: { type: Date, default: Date.now },
  lastRead: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const lastMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  senderName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messageType: { 
    type: String, 
    enum: ["text", "image", "file", "system"], 
    default: "text" 
  }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  allowFileSharing: { type: Boolean, default: true },
  allowMediaSharing: { type: Boolean, default: true },
  allowParticipantMessages: { type: Boolean, default: true },
  messageRetention: { type: Number, default: 30 }, // days
  maxParticipants: { type: Number, default: 100 },
  isPublic: { type: Boolean, default: false },
  requireApproval: { type: Boolean, default: false }
}, { _id: false });

const chatSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Chat name is required'],
      trim: true,
      maxlength: [50, 'Chat name cannot exceed 50 characters']
    },
    description: { 
      type: String, 
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    type: { 
      type: String, 
      enum: ["group", "dm", "channel"], 
      required: true,
      default: "group"
    },
    category: {
      type: String,
      enum: ["general", "work", "social", "support", "announcements"],
      default: "general"
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Avatar must be a valid URL'
      }
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    participants: [participantSchema],
    admins: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    lastMessage: lastMessageSchema,
    isAdminDM: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, maxlength: 20 }],
    
    // Legacy fields for backward compatibility
    legacyLastMessage: lastMessageSchema,
    legacyParticipants: [Object]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
chatSchema.index({ createdBy: 1 });
chatSchema.index({ "participants.user": 1 });
chatSchema.index({ type: 1, isActive: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ updatedAt: -1 });

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.filter(p => p.isActive).length : 0;
});

// Virtual for admin count  
chatSchema.virtual('adminCount').get(function() {
  return this.participants ? this.participants.filter(p => p.role === 'admin' && p.isActive).length : 0;
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId, userName, role = 'member') {
  // Check if user is already a participant
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.role = role;
    return this;
  }

  // Add new participant
  this.participants.push({
    user: userId,
    name: userName,
    role: role,
    joinedAt: new Date(),
    lastRead: new Date(),
    isActive: true
  });

  // Add to admins array if admin role
  if (role === 'admin' && !this.admins.includes(userId)) {
    this.admins.push(userId);
  }

  return this;
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  
  this.admins = this.admins.filter(
    adminId => adminId.toString() !== userId.toString()
  );

  return this;
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString() && p.isActive
  );
};

// Method to check if user is admin
chatSchema.methods.isAdmin = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString() && p.role === 'admin' && p.isActive
  );
};

// Method to update last message
chatSchema.methods.updateLastMessage = function(messageData) {
  this.lastMessage = {
    content: messageData.content,
    sender: messageData.sender,
    senderName: messageData.senderName,
    timestamp: messageData.timestamp || new Date(),
    messageType: messageData.messageType || 'text'
  };
  return this;
};

module.exports = mongoose.model("Chat", chatSchema);
