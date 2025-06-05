import { apiService } from '@/services/apiService';
import { UserProfile, IUserProfile } from '@/models/User';
import { FoodLog, IFoodLog } from '@/models/FoodLog';
import { UserSession, IUserSession } from '@/models/UserSession';

// Database Service Class
export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Initialize localStorage-based database (no API needed)
  public async initialize(): Promise<void> {
    if (!this.isConnected) {
      // Since we're using localStorage-based models, we don't need an API connection
      // Just mark as connected for localStorage operations
      this.isConnected = true;
      console.log('✅ Database service initialized - localStorage ready');
    }
  }

  // User Profile Operations
  public async createOrUpdateUserProfile(userData: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileData: any;
    nutritionPlan: any;
  }): Promise<IUserProfile> {
    await this.initialize();

    try {
      const existingUser = UserProfile.findOne({ clerkId: userData.clerkId });

      if (existingUser) {
        // Update existing user
        const updatedUser = new UserProfile({ ...existingUser, ...userData });
        await updatedUser.save();
        console.log('✅ User profile updated:', userData.clerkId);
        return updatedUser.toObject();
      } else {
        // Create new user
        const newUser = new UserProfile({
          ...userData,
          preferences: {
            units: 'metric',
            notifications: true,
            privacy: 'private',
          },
          streak: {
            current: 0,
            longest: 0,
          },
        });

        await newUser.save();
        console.log('✅ New user profile created:', userData.clerkId);
        return newUser.toObject();
      }
    } catch (error) {
      console.error('❌ Error creating/updating user profile:', error);
      throw error;
    }
  }

  public async getUserProfile(clerkId: string): Promise<IUserProfile | null> {
    await this.initialize();

    try {
      const user = UserProfile.findOne({ clerkId });
      return user;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }

  public async updateUserStreak(clerkId: string): Promise<void> {
    await this.initialize();

    try {
      const userData = UserProfile.findOne({ clerkId });
      if (userData) {
        const user = new UserProfile(userData);
        user.updateStreak();
        await user.save();
        console.log('✅ User streak updated:', clerkId);
      }
    } catch (error) {
      console.error('❌ Error updating user streak:', error);
      throw error;
    }
  }

  // Food Log Operations
  public async createFoodLog(foodLogData: {
    userId: string;
    description: string;
    healthSuggestion: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
    imageData?: {
      originalImage: string;
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
    logDate?: Date;
  }): Promise<IFoodLog> {
    await this.initialize();

    try {
      const foodLog = new FoodLog({
        ...foodLogData,
        logDate: foodLogData.logDate || new Date(),
        isVerified: false,
      });

      await foodLog.save();
      console.log('✅ Food log created:', foodLog._id);

      // Update user streak
      await this.updateUserStreak(foodLogData.userId);

      return foodLog.toObject();
    } catch (error) {
      console.error('❌ Error creating food log:', error);
      throw error;
    }
  }

  public async getFoodLogsForDate(userId: string, date: Date): Promise<IFoodLog[]> {
    await this.initialize();

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Use the static method from FoodLog class
      const logs = FoodLog.getLogsForDateRange(userId, startOfDay, endOfDay);

      return logs;
    } catch (error) {
      console.error('❌ Error fetching food logs for date:', error);
      throw error;
    }
  }

  public async getFoodLogsForDateRange(userId: string, startDate: Date, endDate: Date): Promise<IFoodLog[]> {
    await this.initialize();

    try {
      // Use the static method from FoodLog class
      const logs = FoodLog.getLogsForDateRange(userId, startDate, endDate);

      return logs;
    } catch (error) {
      console.error('❌ Error fetching food logs for date range:', error);
      throw error;
    }
  }

  public async getDailyNutritionTotals(userId: string, date: Date): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    logCount: number;
  }> {
    await this.initialize();

    try {
      // Use the static method from FoodLog class
      const result = FoodLog.getDailyTotals(userId, date);

      return {
        totalCalories: result.totalCalories,
        totalProtein: result.totalProtein,
        totalCarbs: result.totalCarbs,
        totalFats: result.totalFats,
        logCount: result.logCount,
      };
    } catch (error) {
      console.error('❌ Error calculating daily nutrition totals:', error);
      throw error;
    }
  }

  public async updateFoodLogVerification(foodLogId: string, isVerified: boolean): Promise<void> {
    await this.initialize();

    try {
      FoodLog.findByIdAndUpdate(foodLogId, { isVerified });
      console.log('✅ Food log verification updated:', foodLogId);
    } catch (error) {
      console.error('❌ Error updating food log verification:', error);
      throw error;
    }
  }

  public async deleteFoodLog(foodLogId: string): Promise<void> {
    await this.initialize();

    try {
      FoodLog.findByIdAndDelete(foodLogId);
      console.log('✅ Food log deleted:', foodLogId);
    } catch (error) {
      console.error('❌ Error deleting food log:', error);
      throw error;
    }
  }

  // Analytics and Statistics
  public async getUserStats(userId: string, days: number = 30): Promise<{
    totalLogs: number;
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFats: number;
    streakData: {
      current: number;
      longest: number;
    };
  }> {
    await this.initialize();

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const user = UserProfile.findOne({ clerkId: userId });
      const logs = FoodLog.getLogsForDateRange(userId, startDate, endDate);

      const totalLogs = logs.length;
      const totalCalories = logs.reduce((sum, log) => sum + log.nutrition.calories, 0);
      const totalProtein = logs.reduce((sum, log) => sum + log.nutrition.protein, 0);
      const totalCarbs = logs.reduce((sum, log) => sum + log.nutrition.carbs, 0);
      const totalFats = logs.reduce((sum, log) => sum + log.nutrition.fats, 0);

      return {
        totalLogs,
        averageCalories: totalLogs > 0 ? Math.round(totalCalories / totalLogs) : 0,
        averageProtein: totalLogs > 0 ? Math.round(totalProtein / totalLogs) : 0,
        averageCarbs: totalLogs > 0 ? Math.round(totalCarbs / totalLogs) : 0,
        averageFats: totalLogs > 0 ? Math.round(totalFats / totalLogs) : 0,
        streakData: {
          current: user?.streak.current || 0,
          longest: user?.streak.longest || 0,
        },
      };
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error;
    }
  }

  // User Session Operations
  public async getUserSessions(clerkId: string, days: number = 30): Promise<IUserSession[]> {
    await this.initialize();

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sessions = UserSession.getRecentSessions(clerkId, days);

      return sessions;
    } catch (error) {
      console.error('❌ Error fetching user sessions:', error);
      throw error;
    }
  }

  public async getActiveSessions(clerkId: string): Promise<IUserSession[]> {
    await this.initialize();

    try {
      const sessions = UserSession.getActiveSessions(clerkId);

      return sessions;
    } catch (error) {
      console.error('❌ Error fetching active sessions:', error);
      throw error;
    }
  }

  public async getAllUserSessions(): Promise<IUserSession[]> {
    await this.initialize();

    try {
      const sessions = UserSession.find();
      return sessions;
    } catch (error) {
      console.error('❌ Error fetching all user sessions:', error);
      throw error;
    }
  }

  public async getSessionStats(clerkId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    lastSignIn: Date | null;
    signInMethods: Record<string, number>;
  }> {
    await this.initialize();

    try {
      const allSessions = UserSession.find({ clerkId });
      const activeSessions = allSessions.filter(s => s.isActive);

      const totalSessions = allSessions.length;
      const activeCount = activeSessions.length;

      // Calculate average session duration (only for ended sessions)
      const endedSessions = allSessions.filter(s => !s.isActive && s.sessionDuration);
      const averageSessionDuration = endedSessions.length > 0
        ? endedSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / endedSessions.length
        : 0;

      // Get last sign-in
      const lastSignIn = allSessions.length > 0
        ? allSessions.sort((a, b) => b.signInTime.getTime() - a.signInTime.getTime())[0].signInTime
        : null;

      // Count sign-in methods
      const signInMethods: Record<string, number> = {};
      allSessions.forEach(session => {
        signInMethods[session.signInMethod] = (signInMethods[session.signInMethod] || 0) + 1;
      });

      return {
        totalSessions,
        activeSessions: activeCount,
        averageSessionDuration: Math.round(averageSessionDuration),
        lastSignIn,
        signInMethods,
      };
    } catch (error) {
      console.error('❌ Error fetching session stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
