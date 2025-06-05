import { getCollection, saveCollection, generateId } from '@/config/database';

// User Session Interface for tracking sign-ins
export interface IUserSession {
  _id: string;
  clerkId: string; // Clerk user ID
  email: string;
  sessionId?: string; // Clerk session ID if available
  signInMethod: 'email' | 'google' | 'github' | 'facebook' | 'other';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
  };
  signInTime: Date;
  signOutTime?: Date;
  sessionDuration?: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client-side UserSession class
export class UserSession {
  _id: string;
  clerkId: string;
  email: string;
  sessionId?: string;
  signInMethod: 'email' | 'google' | 'github' | 'facebook' | 'other';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
  };
  signInTime: Date;
  signOutTime?: Date;
  sessionDuration?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUserSession>) {
    this._id = data._id || generateId();
    this.clerkId = data.clerkId || '';
    this.email = data.email || '';
    this.sessionId = data.sessionId;
    this.signInMethod = data.signInMethod || 'email';
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.location = data.location;
    this.deviceInfo = data.deviceInfo;
    this.signInTime = data.signInTime || new Date();
    this.signOutTime = data.signOutTime;
    this.sessionDuration = data.sessionDuration;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Method to end session
  endSession(): void {
    this.signOutTime = new Date();
    this.isActive = false;

    if (this.signInTime) {
      const durationMs = this.signOutTime.getTime() - this.signInTime.getTime();
      this.sessionDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    }
    this.updatedAt = new Date();
  }

  // Save to localStorage
  async save(): Promise<UserSession> {
    const sessions = getCollection('userSessions');
    const existingIndex = sessions.findIndex(s => s._id === this._id);

    this.updatedAt = new Date();

    if (existingIndex >= 0) {
      sessions[existingIndex] = this.toObject();
    } else {
      sessions.push(this.toObject());
    }

    saveCollection('userSessions', sessions);
    return this;
  }

  // Convert to plain object
  toObject(): IUserSession {
    return {
      _id: this._id,
      clerkId: this.clerkId,
      email: this.email,
      sessionId: this.sessionId,
      signInMethod: this.signInMethod,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      location: this.location,
      deviceInfo: this.deviceInfo,
      signInTime: this.signInTime,
      signOutTime: this.signOutTime,
      sessionDuration: this.sessionDuration,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods
  static find(query: Partial<IUserSession> = {}): IUserSession[] {
    const sessions = getCollection('userSessions');

    if (Object.keys(query).length === 0) {
      return sessions;
    }

    return sessions.filter(session => {
      return Object.entries(query).every(([key, value]) => {
        if (key === 'signInTime' && typeof value === 'object' && value !== null) {
          // Handle date range queries
          const sessionDate = new Date(session.signInTime);
          if ('$gte' in value && '$lte' in value) {
            return sessionDate >= new Date(value.$gte) && sessionDate <= new Date(value.$lte);
          }
          if ('$gte' in value) {
            return sessionDate >= new Date(value.$gte);
          }
          if ('$lte' in value) {
            return sessionDate <= new Date(value.$lte);
          }
        }
        return session[key as keyof IUserSession] === value;
      });
    });
  }

  static findOne(query: Partial<IUserSession>): IUserSession | null {
    const results = UserSession.find(query);
    return results.length > 0 ? results[0] : null;
  }

  static getActiveSessions(clerkId: string): IUserSession[] {
    return UserSession.find({ clerkId, isActive: true })
      .sort((a, b) => new Date(b.signInTime).getTime() - new Date(a.signInTime).getTime());
  }

  static getRecentSessions(clerkId: string, days: number = 30): IUserSession[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return UserSession.find({ clerkId })
      .filter(session => new Date(session.signInTime) >= startDate)
      .sort((a, b) => new Date(b.signInTime).getTime() - new Date(a.signInTime).getTime());
  }

  // Virtual properties
  get formattedSignInTime(): string {
    return this.signInTime.toLocaleString();
  }

  get status(): string {
    return this.isActive ? 'Active' : 'Ended';
  }
}

export default UserSession;
