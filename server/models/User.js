const mongoose = require('mongoose');

// User Profile Schema
const UserProfileSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  profileData: {
    height: {
      type: Number,
      min: 100, // minimum 100cm
      max: 300, // maximum 300cm
    },
    weight: {
      type: Number,
      min: 30, // minimum 30kg
      max: 300, // maximum 300kg
    },
    age: {
      type: Number,
      min: 13, // minimum age 13
      max: 120, // maximum age 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    activityLevel: {
      type: String,
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain'],
    },
    workoutFrequency: {
      type: String,
    },
  },
  nutritionPlan: {
    calories: {
      type: Number,
      min: 800, // minimum safe calories
      max: 5000, // maximum reasonable calories
    },
    protein: {
      type: Number,
      min: 20,
      max: 300,
    },
    carbs: {
      type: Number,
      min: 50,
      max: 800,
    },
    fats: {
      type: Number,
      min: 20,
      max: 200,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
  },
  streak: {
    current: {
      type: Number,
      default: 0,
      min: 0,
    },
    longest: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLogDate: {
      type: Date,
    },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users',
});

// Indexes for better query performance
UserProfileSchema.index({ clerkId: 1 });
UserProfileSchema.index({ email: 1 });
UserProfileSchema.index({ createdAt: -1 });

// Virtual for full name
UserProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Method to calculate BMI
UserProfileSchema.methods.calculateBMI = function() {
  if (!this.profileData.height || !this.profileData.weight) return null;
  const heightInMeters = this.profileData.height / 100;
  return Number((this.profileData.weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// Method to update streak
UserProfileSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastLog = this.streak.lastLogDate;
  
  if (!lastLog) {
    // First log ever
    this.streak.current = 1;
    this.streak.longest = Math.max(this.streak.longest, 1);
  } else {
    const daysDiff = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streak.current += 1;
      this.streak.longest = Math.max(this.streak.longest, this.streak.current);
    } else if (daysDiff > 1) {
      // Streak broken
      this.streak.current = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
  }
  
  this.streak.lastLogDate = today;
};

module.exports = mongoose.model('UserProfile', UserProfileSchema);
