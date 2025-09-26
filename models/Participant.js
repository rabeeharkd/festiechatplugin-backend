import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Participant must be linked to a user']
  },
  registrationId: {
    type: String,
    unique: true,
    required: [true, 'Registration ID is required']
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },
  academicInfo: {
    college: {
      name: {
        type: String,
        required: [true, 'College name is required']
      },
      address: String,
      website: String
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    course: String,
    yearOfStudy: {
      type: String,
      enum: ['1st', '2nd', '3rd', '4th', 'Graduate', 'Post-Graduate'],
      required: [true, 'Year of study is required']
    },
    rollNumber: String,
    cgpa: Number,
    expectedGraduation: Date
  },
  professionalInfo: {
    skills: [String],
    interests: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String,
      githubUrl: String
    }],
    achievements: [{
      title: String,
      description: String,
      date: Date,
      category: {
        type: String,
        enum: ['academic', 'technical', 'sports', 'cultural', 'other']
      }
    }],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      instagram: String
    }
  },
  registrationDetails: {
    registrationDate: {
      type: Date,
      default: Date.now
    },
    registrationSource: {
      type: String,
      enum: ['website', 'mobile_app', 'referral', 'social_media', 'college', 'other'],
      default: 'website'
    },
    referredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Participant'
    },
    motivationStatement: String,
    expectations: String
  },
  events: [{
    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event'
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
  competitions: [{
    competition: {
      type: mongoose.Schema.ObjectId,
      ref: 'Competition'
    },
    team: {
      name: String,
      members: [{
        participant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Participant'
        },
        role: {
          type: String,
          enum: ['leader', 'member'],
          default: 'member'
        }
      }]
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'qualified', 'eliminated', 'disqualified'],
      default: 'registered'
    },
    score: {
      type: Number,
      default: 0
    },
    rank: Number,
    submissions: [{
      round: String,
      submissionTime: Date,
      score: Number,
      status: String
    }]
  }],
  workshops: [{
    workshop: {
      type: mongoose.Schema.ObjectId,
      ref: 'Workshop'
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
    completionStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateId: String,
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
  accommodationDetails: {
    required: {
      type: Boolean,
      default: false
    },
    preferences: {
      roomType: {
        type: String,
        enum: ['single', 'shared', 'dormitory']
      },
      checkInDate: Date,
      checkOutDate: Date,
      specialRequests: String
    },
    assigned: {
      roomNumber: String,
      hostel: String,
      roommates: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Participant'
      }]
    }
  },
  travelDetails: {
    mode: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'other']
    },
    arrivalDate: Date,
    departureDate: Date,
    needsPickup: {
      type: Boolean,
      default: false
    },
    pickupLocation: String
  },
  dietary: {
    restrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'jain', 'halal', 'kosher', 'gluten_free', 'lactose_intolerant', 'other']
    }],
    allergies: [String],
    preferences: String
  },
  merchandise: [{
    item: String,
    size: String,
    quantity: {
      type: Number,
      default: 1
    },
    collected: {
      type: Boolean,
      default: false
    },
    collectionDate: Date
  }],
  payments: [{
    type: {
      type: String,
      enum: ['registration', 'accommodation', 'merchandise', 'other']
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentDate: Date,
    refundDate: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  notifications: [{
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  qrCode: String,
  badges: [{
    name: String,
    description: String,
    iconUrl: String,
    earnedDate: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    eventsAttended: {
      type: Number,
      default: 0
    },
    competitionsParticipated: {
      type: Number,
      default: 0
    },
    workshopsCompleted: {
      type: Number,
      default: 0
    },
    certificatesEarned: {
      type: Number,
      default: 0
    },
    overallRating: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes
participantSchema.index({ user: 1 })
participantSchema.index({ 'academicInfo.college.name': 1 })
participantSchema.index({ 'academicInfo.department': 1 })
participantSchema.index({ status: 1 })
participantSchema.index({ 'registrationDetails.registrationDate': -1 })

// Virtual for full name
participantSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

// Method to generate registration ID
participantSchema.statics.generateRegistrationId = function() {
  const prefix = 'FEST24'
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${prefix}${randomNum}`
}

// Method to register for event
participantSchema.methods.registerForEvent = function(eventId) {
  const existingRegistration = this.events.find(
    e => e.event.toString() === eventId.toString()
  )
  
  if (existingRegistration) {
    throw new Error('Already registered for this event')
  }
  
  this.events.push({
    event: eventId,
    registrationDate: new Date(),
    status: 'registered'
  })
  
  return this.save()
}

// Method to register for competition
participantSchema.methods.registerForCompetition = function(competitionId, teamData = null) {
  const existingRegistration = this.competitions.find(
    c => c.competition.toString() === competitionId.toString()
  )
  
  if (existingRegistration) {
    throw new Error('Already registered for this competition')
  }
  
  const registrationData = {
    competition: competitionId,
    registrationDate: new Date(),
    status: 'registered'
  }
  
  if (teamData) {
    registrationData.team = teamData
  }
  
  this.competitions.push(registrationData)
  this.statistics.competitionsParticipated += 1
  
  return this.save()
}

// Method to register for workshop
participantSchema.methods.registerForWorkshop = function(workshopId) {
  const existingRegistration = this.workshops.find(
    w => w.workshop.toString() === workshopId.toString()
  )
  
  if (existingRegistration) {
    throw new Error('Already registered for this workshop')
  }
  
  this.workshops.push({
    workshop: workshopId,
    registrationDate: new Date(),
    status: 'registered'
  })
  
  return this.save()
}

// Method to add notification
participantSchema.methods.addNotification = function(message, type = 'info') {
  this.notifications.push({
    message,
    type,
    createdAt: new Date()
  })
  
  return this.save()
}

// Method to mark notification as read
participantSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId)
  if (notification) {
    notification.isRead = true
  }
  
  return this.save()
}

export default mongoose.model('Participant', participantSchema)