import mongoose from 'mongoose'

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Competition title is required'],
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
    enum: ['Programming', 'Artificial Intelligence', 'Web Technology', 'Data Analytics', 'Mobile Development', 'Game Development', 'Cybersecurity', 'Other'],
    required: [true, 'Category is required']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  teamSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 1
    }
  },
  rounds: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    type: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online'
    },
    platform: String,
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    problemStatements: [{
      title: String,
      description: String,
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard']
      },
      points: Number,
      timeLimit: Number,
      memoryLimit: Number,
      inputFormat: String,
      outputFormat: String,
      constraints: String,
      sampleInput: String,
      sampleOutput: String,
      explanation: String
    }]
  }],
  prizes: [{
    position: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    description: String,
    certificate: Boolean
  }],
  rules: [String],
  eligibility: [String],
  technologies: [String],
  judges: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: String,
    designation: String,
    company: String,
    expertise: [String]
  }],
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    team: {
      name: String,
      members: [{
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
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
      enum: ['registered', 'confirmed', 'disqualified', 'withdrawn'],
      default: 'registered'
    },
    submissions: [{
      round: String,
      submissionTime: Date,
      code: String,
      language: String,
      fileUrl: String,
      score: Number,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'partial'],
        default: 'pending'
      },
      feedback: String
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    rank: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'registration', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invitation'],
    default: 'public'
  },
  resources: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['tutorial', 'documentation', 'example', 'dataset', 'tool']
    }
  }],
  statistics: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  socialLinks: {
    website: String,
    discord: String,
    slack: String,
    forum: String
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
competitionSchema.index({ category: 1 })
competitionSchema.index({ status: 1 })
competitionSchema.index({ startDate: 1 })
competitionSchema.index({ registrationDeadline: 1 })

// Virtual for current participants count
competitionSchema.virtual('currentParticipants').get(function() {
  return this.participants.filter(
    p => ['registered', 'confirmed'].includes(p.status)
  ).length
})

// Method to register participant/team
competitionSchema.methods.registerParticipant = function(userId, teamData = null) {
  // Check if already registered
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (existingParticipant) {
    throw new Error('User already registered for this competition')
  }
  
  // Check capacity
  if (this.maxParticipants && this.currentParticipants >= this.maxParticipants) {
    throw new Error('Competition is full')
  }
  
  // Check registration deadline
  if (new Date() > this.registrationDeadline) {
    throw new Error('Registration deadline has passed')
  }
  
  const participantData = {
    user: userId,
    registrationDate: new Date(),
    status: 'registered'
  }
  
  if (teamData && this.teamSize.max > 1) {
    participantData.team = teamData
  }
  
  this.participants.push(participantData)
  this.statistics.totalRegistrations += 1
  
  return this.save()
}

// Method to submit solution
competitionSchema.methods.submitSolution = function(userId, roundName, submissionData) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this competition')
  }
  
  participant.submissions.push({
    round: roundName,
    submissionTime: new Date(),
    ...submissionData
  })
  
  this.statistics.totalSubmissions += 1
  
  return this.save()
}

// Method to update participant score
competitionSchema.methods.updateScore = function(userId, roundScore) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  )
  
  if (!participant) {
    throw new Error('User is not registered for this competition')
  }
  
  participant.totalScore += roundScore
  
  // Recalculate ranks
  this.participants.sort((a, b) => b.totalScore - a.totalScore)
  this.participants.forEach((p, index) => {
    p.rank = index + 1
  })
  
  // Update average score
  const totalScores = this.participants.reduce((sum, p) => sum + p.totalScore, 0)
  this.statistics.averageScore = totalScores / this.participants.length
  
  return this.save()
}

export default mongoose.model('Competition', competitionSchema)