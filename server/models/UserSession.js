const mongoose = require('mongoose');

// User Session Schema for tracking sign-ins
const UserSessionSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  signInMethod: {
    type: String,
    required: true,
    enum: ['email', 'google', 'github', 'facebook', 'other'],
    default: 'email',
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  location: {
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
  },
  deviceInfo: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    os: {
      type: String,
      trim: true,
    },
    browser: {
      type: String,
      trim: true,
    },
  },
  signInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  signOutTime: {
    type: Date,
  },
  sessionDuration: {
    type: Number, // in minutes
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'user_sessions',
});

// Indexes for better query performance
UserSessionSchema.index({ clerkId: 1, signInTime: -1 });
UserSessionSchema.index({ email: 1, signInTime: -1 });
UserSessionSchema.index({ signInTime: -1 });
UserSessionSchema.index({ isActive: 1 });
UserSessionSchema.index({ sessionId: 1 });

// Method to end session
UserSessionSchema.methods.endSession = function() {
  this.signOutTime = new Date();
  this.isActive = false;
  
  if (this.signInTime) {
    const durationMs = this.signOutTime.getTime() - this.signInTime.getTime();
    this.sessionDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
};

// Virtual for formatted sign-in time
UserSessionSchema.virtual('formattedSignInTime').get(function() {
  return this.signInTime.toLocaleString();
});

// Virtual for session status
UserSessionSchema.virtual('status').get(function() {
  return this.isActive ? 'Active' : 'Ended';
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
