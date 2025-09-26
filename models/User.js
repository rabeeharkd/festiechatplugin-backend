import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  refreshTokens: [{
    type: String
  }],
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Single index definition for email
userSchema.index({ email: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email
    },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '15m'
    }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '7d'
    }
  );
};

// Method to add refresh token to database
userSchema.methods.addRefreshToken = async function(refreshToken) {
  // Keep only last 5 tokens per user (multi-device support)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }

  // Add new refresh token
  this.refreshTokens.push(refreshToken);
  await this.save();
  return this;
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = async function(refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(
    token => token !== refreshToken
  );
  await this.save();
  return this;
};

// Method to remove all refresh tokens (logout from all devices)
userSchema.methods.removeAllRefreshTokens = async function() {
  this.refreshTokens = [];
  await this.save();
  return this;
};

// Static method to find user by refresh token
userSchema.statics.findByRefreshToken = async function(refreshToken) {
  return this.findOne({
    refreshTokens: refreshToken
  });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = jwt.sign(
    { userId: this._id, type: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = jwt.sign(
    { userId: this._id, type: 'email-verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

export default mongoose.model('User', userSchema);