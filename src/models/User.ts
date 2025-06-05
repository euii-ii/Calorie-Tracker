import { getCollection, saveCollection, generateId } from '@/config/database';

// User Profile Interface
export interface IUserProfile {
  _id: string;
  clerkId: string; // Clerk user ID for authentication
  email: string;
  firstName?: string;
  lastName?: string;
  profileData: {
    height: number; // in cm
    weight: number; // in kg
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: string;
    goal: 'lose' | 'maintain' | 'gain';
    workoutFrequency: string;
  };
  nutritionPlan: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fats: number; // in grams
    generatedAt: Date;
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privacy: 'public' | 'private';
  };
  streak: {
    current: number;
    longest: number;
    lastLogDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Client-side UserProfile class
export class UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileData: {
    height: number;
    weight: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: string;
    goal: 'lose' | 'maintain' | 'gain';
    workoutFrequency: string;
  };
  nutritionPlan: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    generatedAt: Date;
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privacy: 'public' | 'private';
  };
  streak: {
    current: number;
    longest: number;
    lastLogDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUserProfile>) {
    this._id = data._id || generateId();
    this.clerkId = data.clerkId || '';
    this.email = data.email || '';
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.profileData = data.profileData || {
      height: 170,
      weight: 70,
      age: 25,
      gender: 'other',
      activityLevel: 'moderate',
      goal: 'maintain',
      workoutFrequency: '3-4 times per week'
    };
    this.nutritionPlan = data.nutritionPlan || {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fats: 67,
      generatedAt: new Date()
    };
    this.preferences = data.preferences || {
      units: 'metric',
      notifications: true,
      privacy: 'private'
    };
    this.streak = data.streak || {
      current: 0,
      longest: 0
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Virtual for full name
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // Method to calculate BMI
  calculateBMI(): number {
    const heightInMeters = this.profileData.height / 100;
    return Number((this.profileData.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  // Method to update streak
  updateStreak(): void {
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
    this.updatedAt = new Date();
  }

  // Save to localStorage
  async save(): Promise<UserProfile> {
    const users = getCollection('users');
    const existingIndex = users.findIndex(u => u._id === this._id);

    this.updatedAt = new Date();

    if (existingIndex >= 0) {
      users[existingIndex] = this.toObject();
    } else {
      users.push(this.toObject());
    }

    saveCollection('users', users);
    return this;
  }

  // Convert to plain object
  toObject(): IUserProfile {
    return {
      _id: this._id,
      clerkId: this.clerkId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      profileData: this.profileData,
      nutritionPlan: this.nutritionPlan,
      preferences: this.preferences,
      streak: this.streak,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods
  static findOne(query: Partial<IUserProfile>): IUserProfile | null {
    const users = getCollection('users');
    const user = users.find(u => {
      return Object.entries(query).every(([key, value]) => {
        return u[key as keyof IUserProfile] === value;
      });
    });
    return user || null;
  }

  static find(query: Partial<IUserProfile> = {}): IUserProfile[] {
    const users = getCollection('users');

    if (Object.keys(query).length === 0) {
      return users;
    }

    return users.filter(user => {
      return Object.entries(query).every(([key, value]) => {
        return user[key as keyof IUserProfile] === value;
      });
    });
  }
}

export default UserProfile;
