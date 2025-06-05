import { getCollection, saveCollection, generateId } from '@/config/database';

// Food Log Interface
export interface IFoodLog {
  _id: string;
  userId: string; // Reference to User's clerkId
  description: string;
  healthSuggestion: string;
  nutrition: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fats: number; // in grams
    fiber?: number; // in grams
    sugar?: number; // in grams
    sodium?: number; // in mg
  };
  imageData?: {
    originalImage: string; // base64 encoded image
    thumbnailImage?: string; // smaller version for quick loading
    imageSize: number; // size in bytes
    imageFormat: string; // jpeg, png, etc.
    analysisConfidence: 'high' | 'medium' | 'low';
  };
  aiAnalysis: {
    isFood: boolean;
    confidence: 'high' | 'medium' | 'low';
    detectedItems: string[];
    processingTime?: number; // in milliseconds
    aiService: 'gemini' | 'external' | 'manual';
  };
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logDate: Date; // Date when food was consumed
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[]; // User-defined tags
  notes?: string; // User notes
  isVerified: boolean; // Whether user verified the AI analysis
  createdAt: Date;
  updatedAt: Date;
}

// Client-side FoodLog class
export class FoodLog {
  _id: string;
  userId: string;
  description: string;
  healthSuggestion: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  imageData?: {
    originalImage: string;
    thumbnailImage?: string;
    imageSize: number;
    imageFormat: string;
    analysisConfidence: 'high' | 'medium' | 'low';
  };
  aiAnalysis: {
    isFood: boolean;
    confidence: 'high' | 'medium' | 'low';
    detectedItems: string[];
    processingTime?: number;
    aiService: 'gemini' | 'external' | 'manual';
  };
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logDate: Date;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
  notes?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IFoodLog>) {
    this._id = data._id || generateId();
    this.userId = data.userId || '';
    this.description = data.description || '';
    this.healthSuggestion = data.healthSuggestion || '';
    this.nutrition = data.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };
    this.imageData = data.imageData;
    this.aiAnalysis = data.aiAnalysis || {
      isFood: true,
      confidence: 'medium',
      detectedItems: [],
      aiService: 'gemini'
    };
    this.mealType = data.mealType;
    this.logDate = data.logDate || new Date();
    this.location = data.location;
    this.tags = data.tags;
    this.notes = data.notes;
    this.isVerified = data.isVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Virtual for total macros
  get totalMacros(): number {
    return this.nutrition.protein + this.nutrition.carbs + this.nutrition.fats;
  }

  // Method to calculate calories from macros (for validation)
  calculateCaloriesFromMacros(): number {
    return (this.nutrition.protein * 4) + (this.nutrition.carbs * 4) + (this.nutrition.fats * 9);
  }

  // Method to get formatted date
  getFormattedDate(): string {
    return this.logDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Save to localStorage
  async save(): Promise<FoodLog> {
    const foodLogs = getCollection('foodLogs');
    const existingIndex = foodLogs.findIndex(f => f._id === this._id);

    this.updatedAt = new Date();

    if (existingIndex >= 0) {
      foodLogs[existingIndex] = this.toObject();
    } else {
      foodLogs.push(this.toObject());
    }

    saveCollection('foodLogs', foodLogs);
    return this;
  }

  // Convert to plain object
  toObject(): IFoodLog {
    return {
      _id: this._id,
      userId: this.userId,
      description: this.description,
      healthSuggestion: this.healthSuggestion,
      nutrition: this.nutrition,
      imageData: this.imageData,
      aiAnalysis: this.aiAnalysis,
      mealType: this.mealType,
      logDate: this.logDate,
      location: this.location,
      tags: this.tags,
      notes: this.notes,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods
  static find(query: Partial<IFoodLog> = {}): IFoodLog[] {
    const foodLogs = getCollection('foodLogs');

    if (Object.keys(query).length === 0) {
      return foodLogs;
    }

    return foodLogs.filter(log => {
      return Object.entries(query).every(([key, value]) => {
        if (key === 'logDate' && typeof value === 'object' && value !== null) {
          // Handle date range queries
          const logDate = new Date(log.logDate);
          if ('$gte' in value && '$lte' in value) {
            return logDate >= new Date(value.$gte) && logDate <= new Date(value.$lte);
          }
          if ('$gte' in value) {
            return logDate >= new Date(value.$gte);
          }
          if ('$lte' in value) {
            return logDate <= new Date(value.$lte);
          }
        }
        return log[key as keyof IFoodLog] === value;
      });
    });
  }

  static findById(id: string): IFoodLog | null {
    const foodLogs = getCollection('foodLogs');
    return foodLogs.find(log => log._id === id) || null;
  }

  static findByIdAndDelete(id: string): boolean {
    const foodLogs = getCollection('foodLogs');
    const index = foodLogs.findIndex(log => log._id === id);

    if (index >= 0) {
      foodLogs.splice(index, 1);
      saveCollection('foodLogs', foodLogs);
      return true;
    }

    return false;
  }

  static findByIdAndUpdate(id: string, update: Partial<IFoodLog>): IFoodLog | null {
    const foodLogs = getCollection('foodLogs');
    const index = foodLogs.findIndex(log => log._id === id);

    if (index >= 0) {
      foodLogs[index] = { ...foodLogs[index], ...update, updatedAt: new Date() };
      saveCollection('foodLogs', foodLogs);
      return foodLogs[index];
    }

    return null;
  }

  // Static method to get logs for a specific date range
  static getLogsForDateRange(userId: string, startDate: Date, endDate: Date): IFoodLog[] {
    return FoodLog.find({
      userId,
      logDate: {
        $gte: startDate,
        $lte: endDate,
      } as any,
    }).sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  }

  // Static method to get daily totals
  static getDailyTotals(userId: string, date: Date): {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
    logCount: number;
  } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = FoodLog.find({
      userId,
      logDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      } as any,
    });

    return logs.reduce((totals, log) => ({
      totalCalories: totals.totalCalories + log.nutrition.calories,
      totalProtein: totals.totalProtein + log.nutrition.protein,
      totalCarbs: totals.totalCarbs + log.nutrition.carbs,
      totalFats: totals.totalFats + log.nutrition.fats,
      totalFiber: totals.totalFiber + (log.nutrition.fiber || 0),
      totalSugar: totals.totalSugar + (log.nutrition.sugar || 0),
      totalSodium: totals.totalSodium + (log.nutrition.sodium || 0),
      logCount: totals.logCount + 1,
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalFiber: 0,
      totalSugar: 0,
      totalSodium: 0,
      logCount: 0,
    });
  }
}

export default FoodLog;
