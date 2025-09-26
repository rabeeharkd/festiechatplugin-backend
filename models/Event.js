import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['ceremony', 'competition', 'workshop', 'expo', 'cultural', 'networking', 'technical'],
    required: [true, 'Event category is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required']
    },
    address: String,
    capacity: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  organizers: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'coordinator', 'volunteer'],
      default: 'coordinator'
    }
  }],
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled'],
      default: 'registered'
    },
    checkInTime: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  }],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  registrationDeadline: Date,
  status: {
    type: String,
    enum: ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  images: [{
    url: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['schedule', 'rules', 'guidelines', 'certificate', 'other']
    }
  }],
  requirements: [String],
  prizes: [{
    position: String,
    amount: String,
    description: String
  }],
  tags: [String],
  isFeature: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
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

// Indexes
eventSchema.index({ date: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ status: 1 })
eventSchema.index({ 'venue.location': '2dsphere' })
eventSchema.index({ tags: 1 })

// Virtual for current participant count
eventSchema.virtual('currentParticipants').get(function() {
  return this.participants.filter(
    p => ['registered', 'confirmed', 'attended'].includes(p.status)
  ).length
})

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.maxParticipants) return null
  return this.maxParticipants - this.currentParticipants
})

// Method to register participant
eventSchema.methods.registerParticipant = function(userId) {
  // Check if already registered
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (existingParticipant) {
    throw new Error('User already registered for this event')
  }
  
  // Check capacity
  if (this.maxParticipants && this.currentParticipants >= this.maxParticipants) {
    throw new Error('Event is full')
  }
  
  // Check registration deadline
  if (this.registrationDeadline && new Date() > this.registrationDeadline) {
    throw new Error('Registration deadline has passed')
  }
  
  this.participants.push({
    user: userId,
    registrationDate: new Date(),
    status: 'registered'
  })
  
  this.statistics.registrations += 1
  
  return this.save()
}

// Method to cancel registration
eventSchema.methods.cancelRegistration = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this event')
  }
  
  participant.status = 'cancelled'
  this.statistics.registrations = Math.max(0, this.statistics.registrations - 1)
  
  return this.save()
}

// Method to mark attendance
eventSchema.methods.markAttendance = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this event')
  }
  
  participant.status = 'attended'
  participant.checkInTime = new Date()
  this.statistics.attendance += 1
  
  return this.save()
}

export default mongoose.model('Event', eventSchema)