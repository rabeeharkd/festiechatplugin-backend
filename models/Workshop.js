import mongoose from 'mongoose'

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workshop title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['AI/ML', 'Web Development', 'Mobile Development', 'Data Science', 'Blockchain', 'Cybersecurity', 'DevOps', 'UI/UX', 'Other'],
    required: [true, 'Category is required']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  instructor: {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Instructor name is required']
    },
    designation: String,
    company: String,
    bio: String,
    expertise: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String
    },
    avatar: String
  },
  coInstructors: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: String,
    designation: String,
    company: String,
    role: {
      type: String,
      enum: ['co-instructor', 'assistant', 'mentor'],
      default: 'co-instructor'
    }
  }],
  date: {
    type: Date,
    required: [true, 'Workshop date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  venue: {
    type: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline'
    },
    name: String,
    address: String,
    capacity: Number,
    platform: String, // for online workshops
    meetingLink: String,
    meetingId: String,
    passcode: String
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants limit is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  prerequisites: [String],
  learningObjectives: [String],
  agenda: [{
    topic: {
      type: String,
      required: true
    },
    duration: String,
    description: String,
    type: {
      type: String,
      enum: ['lecture', 'hands-on', 'demo', 'discussion', 'break'],
      default: 'lecture'
    }
  }],
  materials: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['presentation', 'code', 'dataset', 'documentation', 'tool', 'other']
    },
    url: String,
    isDownloadable: {
      type: Boolean,
      default: true
    },
    accessLevel: {
      type: String,
      enum: ['public', 'registered', 'attended'],
      default: 'registered'
    }
  }],
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled', 'no-show'],
      default: 'registered'
    },
    checkInTime: Date,
    checkOutTime: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      suggestions: String,
      wouldRecommend: Boolean,
      submittedAt: Date
    },
    certificate: {
      issued: {
        type: Boolean,
        default: false
      },
      issuedDate: Date,
      certificateId: String,
      downloadUrl: String
    },
    attendance: {
      percentage: {
        type: Number,
        default: 0
      },
      checkins: [{
        time: Date,
        activity: String
      }]
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'registration_open', 'registration_closed', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  registrationFee: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    earlyBird: {
      amount: Number,
      deadline: Date
    }
  },
  technologies: [String],
  tools: [String],
  certification: {
    available: {
      type: Boolean,
      default: true
    },
    criteria: {
      attendanceRequired: {
        type: Number,
        default: 80 // percentage
      },
      assignmentRequired: Boolean,
      quizRequired: Boolean
    },
    template: String,
    issuer: String
  },
  resources: {
    recordingUrl: String,
    slidesUrl: String,
    codeRepository: String,
    additionalLinks: [{
      title: String,
      url: String,
      description: String
    }]
  },
  feedback: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalResponses: {
      type: Number,
      default: 0
    },
    ratingDistribution: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },
  statistics: {
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    certificatesIssued: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  socialLinks: {
    eventPage: String,
    community: String,
    discord: String,
    slack: String
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
workshopSchema.index({ category: 1 })
workshopSchema.index({ status: 1 })
workshopSchema.index({ date: 1 })
workshopSchema.index({ registrationDeadline: 1 })
workshopSchema.index({ 'instructor.name': 1 })

// Virtual for current participants count
workshopSchema.virtual('currentParticipants').get(function() {
  return this.participants.filter(
    p => ['registered', 'confirmed', 'attended'].includes(p.status)
  ).length
})

// Virtual for available spots
workshopSchema.virtual('availableSpots').get(function() {
  return this.maxParticipants - this.currentParticipants
})

// Method to register participant
workshopSchema.methods.registerParticipant = function(userId) {
  // Check if already registered
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (existingParticipant) {
    throw new Error('User already registered for this workshop')
  }
  
  // Check capacity
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error('Workshop is full')
  }
  
  // Check registration deadline
  if (new Date() > this.registrationDeadline) {
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

// Method to mark attendance
workshopSchema.methods.markAttendance = function(userId, checkInTime = new Date()) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this workshop')
  }
  
  participant.status = 'attended'
  participant.checkInTime = checkInTime
  
  // Add to attendance checkins
  participant.attendance.checkins.push({
    time: checkInTime,
    activity: 'Workshop Check-in'
  })
  
  this.statistics.attendance += 1
  
  return this.save()
}

// Method to submit feedback
workshopSchema.methods.submitFeedback = function(userId, feedbackData) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this workshop')
  }
  
  participant.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  }
  
  // Update overall feedback statistics
  this.feedback.totalResponses += 1
  this.feedback.ratingDistribution[this.getRatingKey(feedbackData.rating)] += 1
  
  // Recalculate average rating
  const totalRating = this.participants
    .filter(p => p.feedback && p.feedback.rating)
    .reduce((sum, p) => sum + p.feedback.rating, 0)
  
  this.feedback.averageRating = totalRating / this.feedback.totalResponses
  
  return this.save()
}

// Helper method for rating distribution
workshopSchema.methods.getRatingKey = function(rating) {
  const keys = { 5: 'five', 4: 'four', 3: 'three', 2: 'two', 1: 'one' }
  return keys[rating] || 'one'
}

export default mongoose.model('Workshop', workshopSchema)