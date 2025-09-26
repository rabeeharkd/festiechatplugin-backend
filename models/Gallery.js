import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['ceremony', 'competition', 'workshop', 'expo', 'cultural', 'networking', 'behind_scenes', 'awards', 'other'],
    required: [true, 'Category is required']
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event'
  },
  competition: {
    type: mongoose.Schema.ObjectId,
    ref: 'Competition'
  },
  workshop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Workshop'
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  photographer: {
    name: String,
    contact: String,
    social: String
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: [true, 'Media URL is required']
    },
    thumbnailUrl: String,
    caption: String,
    altText: String,
    filename: String,
    originalName: String,
    size: Number, // in bytes
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // for videos, in seconds
    format: String, // jpg, png, mp4, etc.
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    metadata: {
      camera: String,
      lens: String,
      settings: {
        iso: Number,
        aperture: String,
        shutterSpeed: String,
        focalLength: String
      },
      location: {
        venue: String,
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: '2dsphere'
        }
      },
      timestamp: Date
    },
    tags: [String],
    people: [{
      participant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Participant'
      },
      name: String,
      position: {
        x: Number, // percentage from left
        y: Number  // percentage from top
      }
    }],
    isPublic: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    likes: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      comment: {
        type: String,
        required: [true, 'Comment text is required'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    downloads: {
      count: {
        type: Number,
        default: 0
      },
      allowDownload: {
        type: Boolean,
        default: true
      },
      watermark: {
        type: Boolean,
        default: false
      }
    },
    views: {
      count: {
        type: Number,
        default: 0
      },
      uniqueViews: [{
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        viewedAt: {
          type: Date,
          default: Date.now
        },
        ipAddress: String
      }]
    },
    status: {
      type: String,
      enum: ['processing', 'published', 'private', 'flagged', 'removed'],
      default: 'published'
    }
  }],
  albums: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    coverImage: String,
    mediaItems: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Media'
    }],
    isPublic: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'participants_only', 'organizers_only'],
    default: 'public'
  },
  permissions: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowLikes: {
      type: Boolean,
      default: true
    },
    allowDownloads: {
      type: Boolean,
      default: true
    },
    allowSharing: {
      type: Boolean,
      default: true
    }
  },
  tags: [String],
  socialSharing: {
    facebook: {
      shared: {
        type: Boolean,
        default: false
      },
      postId: String,
      sharedAt: Date
    },
    instagram: {
      shared: {
        type: Boolean,
        default: false
      },
      postId: String,
      sharedAt: Date
    },
    twitter: {
      shared: {
        type: Boolean,
        default: false
      },
      tweetId: String,
      sharedAt: Date
    }
  },
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
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
gallerySchema.index({ category: 1 })
gallerySchema.index({ date: -1 })
gallerySchema.index({ event: 1 })
gallerySchema.index({ competition: 1 })
gallerySchema.index({ workshop: 1 })
gallerySchema.index({ tags: 1 })
gallerySchema.index({ status: 1 })
gallerySchema.index({ visibility: 1 })

// Virtual for total media count
gallerySchema.virtual('totalMedia').get(function() {
  return this.media.length
})

// Virtual for published media count
gallerySchema.virtual('publishedMedia').get(function() {
  return this.media.filter(m => m.status === 'published').length
})

// Method to add media item
gallerySchema.methods.addMedia = function(mediaData) {
  this.media.push({
    ...mediaData,
    uploadedAt: new Date()
  })
  
  return this.save()
}

// Method to like media item
gallerySchema.methods.likeMedia = function(mediaId, userId) {
  const media = this.media.id(mediaId)
  if (!media) {
    throw new Error('Media not found')
  }
  
  // Check if already liked
  const existingLike = media.likes.find(
    like => like.user.toString() === userId.toString()
  )
  
  if (existingLike) {
    // Remove like
    media.likes = media.likes.filter(
      like => like.user.toString() !== userId.toString()
    )
    this.statistics.totalLikes = Math.max(0, this.statistics.totalLikes - 1)
  } else {
    // Add like
    media.likes.push({
      user: userId,
      likedAt: new Date()
    })
    this.statistics.totalLikes += 1
  }
  
  return this.save()
}

// Method to add comment to media
gallerySchema.methods.addComment = function(mediaId, userId, commentText) {
  const media = this.media.id(mediaId)
  if (!media) {
    throw new Error('Media not found')
  }
  
  media.comments.push({
    user: userId,
    comment: commentText,
    createdAt: new Date()
  })
  
  this.statistics.totalComments += 1
  
  return this.save()
}

// Method to increment view count
gallerySchema.methods.incrementView = function(mediaId, userId = null, ipAddress = null) {
  const media = this.media.id(mediaId)
  if (!media) {
    throw new Error('Media not found')
  }
  
  media.views.count += 1
  this.statistics.totalViews += 1
  
  // Track unique views if user is provided
  if (userId) {
    const existingView = media.views.uniqueViews.find(
      view => view.user && view.user.toString() === userId.toString()
    )
    
    if (!existingView) {
      media.views.uniqueViews.push({
        user: userId,
        viewedAt: new Date(),
        ipAddress
      })
    }
  }
  
  return this.save()
}

// Method to increment download count
gallerySchema.methods.incrementDownload = function(mediaId) {
  const media = this.media.id(mediaId)
  if (!media) {
    throw new Error('Media not found')
  }
  
  if (!media.downloads.allowDownload) {
    throw new Error('Downloads not allowed for this media')
  }
  
  media.downloads.count += 1
  this.statistics.totalDownloads += 1
  
  return this.save()
}

export default mongoose.model('Gallery', gallerySchema)