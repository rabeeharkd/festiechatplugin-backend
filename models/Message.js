const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
    required: [true, 'Message must belong to a chat']
  },
  sender: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String for backwards compatibility
    required: [true, 'Message must have a sender']
  },
  senderEmail: {
    type: String,
    required: false // Optional for backwards compatibility
  },
  senderName: {
    type: String,
    required: false // Optional for backwards compatibility
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text' && !this.isForwarded
    },
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'voice', 'video', 'location', 'contact'],
    required: true,
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    cloudinaryId: String,
    duration: Number, // for audio/video files
    dimensions: {
      width: Number,
      height: Number
    }
  }],
  replyTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
    default: null
  },
  isForwarded: {
    type: Boolean,
    default: false
  },
  forwardedFrom: {
    originalSender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    originalChat: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat'
    },
    forwardChain: {
      type: Number,
      default: 1
    }
  },
  reactions: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  metadata: {
    platform: String,
    deviceInfo: String,
    ipAddress: String
  }
}, {
  timestamps: true
})

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })
messageSchema.index({ replyTo: 1 })
messageSchema.index({ isDeleted: 1 })

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {}
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1
  })
  return counts
})

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  )
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  })
  
  return this.save()
}

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  )
  
  return this.save()
}

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(
    r => r.user.toString() === userId.toString()
  )
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    })
    
    // Update status if this is the last unread user
    if (this.status !== 'read') {
      this.status = 'read'
    }
  }
  
  return this.save()
}

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  // Save edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  })
  
  this.content = newContent
  this.isEdited = true
  
  return this.save()
}

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = deletedBy
  
  return this.save()
}

module.exports = mongoose.model('Message', messageSchema)