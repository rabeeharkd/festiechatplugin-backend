import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chat name is required'],
    trim: true,
    maxlength: [100, 'Chat name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'announcement', 'dm', 'channel'],
    required: true,
    default: 'group'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: '/api/placeholder/40/40'
  },
  isAdminDM: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  legacyParticipants: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  admins: [{
    type: String // Store admin names instead of user IDs
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  legacyLastMessage: {
    content: String,
    sender: {
      type: String // Store sender name instead of user ID
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video', 'location'],
      default: 'text'
    }
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'coordination', 'announcement', 'support'],
    default: 'general'
  },
  settings: {
    allowParticipantMessages: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowMediaSharing: {
      type: Boolean,
      default: true
    },
    messageRetention: {
      type: Number,
      default: 0 // 0 means indefinite, otherwise days
    }
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Index for better query performance
chatSchema.index({ participants: 1 })
chatSchema.index({ createdAt: -1 })
chatSchema.index({ 'lastMessage.timestamp': -1 })

// Virtual for unread message count (to be populated by application logic)
chatSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat',
  count: true,
  match: { isRead: false }
})

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      lastRead: new Date()
    })
  }
  
  return this.save()
}

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  )
  
  // Remove from admins if they were admin
  this.admins = this.admins.filter(
    adminId => adminId.toString() !== userId.toString()
  )
  
  return this.save()
}

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString()
  )
}

// Method to check if user is admin
chatSchema.methods.isAdmin = function(userId) {
  return this.admins.some(
    adminId => adminId.toString() === userId.toString()
  )
}

export default mongoose.model('Chat', chatSchema)