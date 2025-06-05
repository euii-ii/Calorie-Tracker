const mongoose = require('mongoose');

// Food Log Schema
const FoodLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  healthSuggestion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  nutrition: {
    calories: {
      type: Number,
      required: true,
      min: 0,
      max: 5000,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
      max: 200,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    fats: {
      type: Number,
      required: true,
      min: 0,
      max: 200,
    },
    fiber: {
      type: Number,
      min: 0,
      max: 100,
    },
    sugar: {
      type: Number,
      min: 0,
      max: 200,
    },
    sodium: {
      type: Number,
      min: 0,
      max: 10000, // in mg
    },
  },
  imageData: {
    originalImage: {
      type: String, // base64 encoded
      maxlength: 10000000, // ~7MB limit for base64
    },
    thumbnailImage: {
      type: String, // smaller base64 encoded image
      maxlength: 1000000, // ~750KB limit
    },
    imageSize: {
      type: Number,
      min: 0,
    },
    imageFormat: {
      type: String,
      enum: ['jpeg', 'jpg', 'png', 'webp'],
      lowercase: true,
    },
    analysisConfidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
  },
  aiAnalysis: {
    isFood: {
      type: Boolean,
      required: true,
      default: true,
    },
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    detectedItems: [{
      type: String,
      trim: true,
    }],
    processingTime: {
      type: Number,
      min: 0,
    },
    aiService: {
      type: String,
      enum: ['gemini', 'external', 'manual'],
      required: true,
      default: 'gemini',
    },
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  },
  logDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50,
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'foodlogs',
});

// Indexes for better query performance
FoodLogSchema.index({ userId: 1, logDate: -1 });
FoodLogSchema.index({ userId: 1, createdAt: -1 });
FoodLogSchema.index({ logDate: -1 });
FoodLogSchema.index({ 'aiAnalysis.isFood': 1 });
FoodLogSchema.index({ mealType: 1 });

// Virtual for total macros
FoodLogSchema.virtual('totalMacros').get(function() {
  return this.nutrition.protein + this.nutrition.carbs + this.nutrition.fats;
});

// Method to calculate calories from macros (for validation)
FoodLogSchema.methods.calculateCaloriesFromMacros = function() {
  return (this.nutrition.protein * 4) + (this.nutrition.carbs * 4) + (this.nutrition.fats * 9);
};

// Method to get formatted date
FoodLogSchema.methods.getFormattedDate = function() {
  return this.logDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

module.exports = mongoose.model('FoodLog', FoodLogSchema);
