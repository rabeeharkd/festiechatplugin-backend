import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.ObjectId,
    ref: 'Competition',
    required: [true, 'Result must be linked to a competition']
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event'
  },
  round: {
    name: String,
    number: Number
  },
  category: {
    type: String,
    enum: ['Programming', 'Artificial Intelligence', 'Web Technology', 'Data Analytics', 'Mobile Development', 'Game Development', 'Cybersecurity', 'Other'],
    required: [true, 'Category is required']
  },
  type: {
    type: String,
    enum: ['individual', 'team'],
    required: [true, 'Result type is required']
  },
  rankings: [{
    position: {
      type: Number,
      required: [true, 'Position is required']
    },
    participant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Participant'
    },
    team: {
      name: String,
      members: [{
        participant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Participant'
        },
        name: String,
        college: String,
        role: {
          type: String,
          enum: ['leader', 'member'],
          default: 'member'
        }
      }]
    },
    college: String,
    score: {
      type: Number,
      required: [true, 'Score is required']
    },
    details: {
      problemsSolved: Number,
      accuracy: Number,
      timeElapsed: Number, // in minutes
      penalty: Number,
      bonusPoints: Number,
      submissionCount: Number,
      lastSubmissionTime: Date
    },
    prizes: [{
      type: {
        type: String,
        enum: ['cash', 'certificate', 'trophy', 'medal', 'voucher', 'internship', 'other']
      },
      value: String,
      description: String
    }],
    achievements: [{
      title: String,
      description: String,
      badge: String
    }]
  }],
  statistics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalTeams: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    lowestScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    collegeParticipation: [{
      college: String,
      participantCount: Number,
      topRank: Number,
      averageRank: Number
    }]
  },
  judges: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: String,
    designation: String,
    company: String,
    score: Number,
    feedback: String
  }],
  leaderboard: {
    individual: [{
      rank: Number,
      participant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Participant'
      },
      name: String,
      college: String,
      score: Number,
      points: Number
    }],
    college: [{
      rank: Number,
      college: String,
      totalPoints: Number,
      participantCount: Number,
      topPerformers: [{
        participant: {
          type: mongoose.Schema.ObjectId,
          ref: 'Participant'
        },
        rank: Number,
        score: Number
      }],
      medals: {
        gold: { type: Number, default: 0 },
        silver: { type: Number, default: 0 },
        bronze: { type: Number, default: 0 }
      }
    }]
  },
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    event: {
      type: String,
      enum: ['result_published', 'result_updated', 'prize_distributed', 'certificate_issued', 'appeal_submitted', 'appeal_resolved'],
      required: true
    },
    description: String,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  certificates: [{
    participant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Participant'
    },
    type: {
      type: String,
      enum: ['winner', 'runner_up', 'participation', 'achievement'],
      required: true
    },
    position: String,
    certificateId: {
      type: String,
      unique: true
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    downloadUrl: String,
    verificationCode: String,
    template: String,
    digitalSignature: String
  }],
  appeals: [{
    participant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Participant'
    },
    reason: {
      type: String,
      required: [true, 'Appeal reason is required']
    },
    description: String,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },
    response: String,
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    originalScore: Number,
    revisedScore: Number
  }],
  publication: {
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    publishedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    visibility: {
      type: String,
      enum: ['public', 'participants_only', 'organizers_only'],
      default: 'public'
    },
    announcement: {
      title: String,
      message: String,
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push_notification', 'website', 'social_media']
      }]
    }
  },
  feedback: [{
    participant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Participant'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    suggestions: String,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    resultCalculationMethod: String,
    scoringCriteria: [String],
    tieBreakingRules: [String],
    disqualificationReasons: [String],
    dataSource: String,
    lastCalculated: Date,
    version: {
      type: Number,
      default: 1
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'updated', 'finalized', 'archived'],
    default: 'draft'
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
resultSchema.index({ competition: 1 })
resultSchema.index({ event: 1 })
resultSchema.index({ category: 1 })
resultSchema.index({ status: 1 })
resultSchema.index({ 'publication.isPublished': 1 })
resultSchema.index({ 'rankings.position': 1 })
resultSchema.index({ 'rankings.participant': 1 })
resultSchema.index({ 'rankings.college': 1 })

// Virtual for winner
resultSchema.virtual('winner').get(function() {
  const firstPlace = this.rankings.find(r => r.position === 1)
  return firstPlace || null
})

// Virtual for top 3
resultSchema.virtual('topThree').get(function() {
  return this.rankings
    .filter(r => r.position <= 3)
    .sort((a, b) => a.position - b.position)
})

// Method to add ranking
resultSchema.methods.addRanking = function(rankingData) {
  // Check if participant already has a ranking
  const existingRanking = this.rankings.find(r => 
    r.participant && r.participant.toString() === rankingData.participant.toString()
  )
  
  if (existingRanking) {
    // Update existing ranking
    Object.assign(existingRanking, rankingData)
  } else {
    // Add new ranking
    this.rankings.push(rankingData)
  }
  
  // Sort rankings by position
  this.rankings.sort((a, b) => a.position - b.position)
  
  // Update statistics
  this.updateStatistics()
  
  return this.save()
}

// Method to update statistics
resultSchema.methods.updateStatistics = function() {
  const scores = this.rankings.map(r => r.score).filter(s => s !== undefined)
  
  this.statistics.totalParticipants = this.rankings.length
  this.statistics.averageScore = scores.length > 0 ? 
    scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  this.statistics.highestScore = scores.length > 0 ? Math.max(...scores) : 0
  this.statistics.lowestScore = scores.length > 0 ? Math.min(...scores) : 0
  
  // Calculate college participation
  const collegeStats = {}
  this.rankings.forEach(ranking => {
    const college = ranking.college
    if (college) {
      if (!collegeStats[college]) {
        collegeStats[college] = {
          college,
          participantCount: 0,
          ranks: [],
          topRank: Infinity
        }
      }
      collegeStats[college].participantCount += 1
      collegeStats[college].ranks.push(ranking.position)
      collegeStats[college].topRank = Math.min(collegeStats[college].topRank, ranking.position)
    }
  })
  
  this.statistics.collegeParticipation = Object.values(collegeStats).map(stat => ({
    college: stat.college,
    participantCount: stat.participantCount,
    topRank: stat.topRank === Infinity ? null : stat.topRank,
    averageRank: stat.ranks.reduce((sum, rank) => sum + rank, 0) / stat.ranks.length
  }))
}

// Method to publish results
resultSchema.methods.publishResults = function(publishedBy, announcementData = null) {
  this.publication.isPublished = true
  this.publication.publishedAt = new Date()
  this.publication.publishedBy = publishedBy
  this.status = 'published'
  
  if (announcementData) {
    this.publication.announcement = announcementData
  }
  
  this.timeline.push({
    event: 'result_published',
    description: 'Results published to participants',
    updatedBy: publishedBy
  })
  
  return this.save()
}

// Method to issue certificate
resultSchema.methods.issueCertificate = function(participantId, certificateData) {
  const certificateId = `CERT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  this.certificates.push({
    participant: participantId,
    certificateId,
    verificationCode: Math.random().toString(36).substr(2, 12).toUpperCase(),
    ...certificateData
  })
  
  return this.save()
}

// Method to submit appeal
resultSchema.methods.submitAppeal = function(participantId, appealData) {
  this.appeals.push({
    participant: participantId,
    ...appealData,
    submittedAt: new Date()
  })
  
  this.timeline.push({
    event: 'appeal_submitted',
    description: `Appeal submitted by participant`,
    updatedBy: participantId
  })
  
  return this.save()
}

// Method to resolve appeal
resultSchema.methods.resolveAppeal = function(appealId, resolution, reviewedBy) {
  const appeal = this.appeals.id(appealId)
  if (!appeal) {
    throw new Error('Appeal not found')
  }
  
  appeal.status = resolution.status
  appeal.response = resolution.response
  appeal.reviewedBy = reviewedBy
  appeal.reviewedAt = new Date()
  
  if (resolution.revisedScore !== undefined) {
    appeal.revisedScore = resolution.revisedScore
    
    // Update participant score in rankings
    const ranking = this.rankings.find(r => 
      r.participant && r.participant.toString() === appeal.participant.toString()
    )
    
    if (ranking) {
      appeal.originalScore = ranking.score
      ranking.score = resolution.revisedScore
      
      // Recalculate rankings
      this.rankings.sort((a, b) => b.score - a.score)
      this.rankings.forEach((r, index) => {
        r.position = index + 1
      })
      
      this.updateStatistics()
    }
  }
  
  this.timeline.push({
    event: 'appeal_resolved',
    description: `Appeal ${resolution.status}`,
    updatedBy: reviewedBy
  })
  
  return this.save()
}

export default mongoose.model('Result', resultSchema)