import { apiService } from '@/services/apiService';
import { UserSession, IUserSession } from '@/models/UserSession';
import { UserProfile, IUserProfile } from '@/models/User';

// Device detection utility
const detectDevice = (userAgent: string): { type: 'desktop' | 'mobile' | 'tablet' | 'unknown'; os?: string; browser?: string } => {
  const ua = userAgent.toLowerCase();
  
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  let os: string | undefined;
  let browser: string | undefined;
  
  // Device type detection
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    deviceType = 'desktop';
  }
  
  // OS detection
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  
  // Browser detection
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/opera/i.test(ua)) browser = 'Opera';
  
  return { type: deviceType, os, browser };
};

// Sign-in method detection
const detectSignInMethod = (user: any): 'email' | 'google' | 'github' | 'facebook' | 'other' => {
  if (!user?.externalAccounts || user.externalAccounts.length === 0) {
    return 'email';
  }
  
  const provider = user.externalAccounts[0]?.provider?.toLowerCase();
  
  switch (provider) {
    case 'google':
      return 'google';
    case 'github':
      return 'github';
    case 'facebook':
      return 'facebook';
    default:
      return 'other';
  }
};

// Authentication Service Class
export class AuthService {
  private static instance: AuthService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize localStorage-based auth service (no API needed)
  public async initialize(): Promise<void> {
    if (!this.isConnected) {
      // Since we're using localStorage-based models, we don't need an API connection
      // Just mark as connected for localStorage operations
      this.isConnected = true;
      console.log('✅ Auth service initialized - localStorage ready');
    }
  }

  // Track user sign-in
  public async trackSignIn(user: any, sessionId?: string): Promise<IUserSession> {
    await this.initialize();

    try {
      // Get browser information
      const userAgent = navigator.userAgent || '';
      const deviceInfo = detectDevice(userAgent);
      const signInMethod = detectSignInMethod(user);

      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Create session record
      const sessionData = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
        sessionId,
        signInMethod,
        userAgent,
        location: {
          timezone,
        },
        deviceInfo,
        signInTime: new Date(),
        isActive: true,
      };

      // Create session using localStorage-based UserSession model
      const userSession = new UserSession(sessionData);
      await userSession.save();

      console.log('✅ Sign-in tracked:', {
        clerkId: user.id,
        email: sessionData.email,
        method: signInMethod,
        device: deviceInfo.type,
        time: userSession.signInTime,
      });

      // Also ensure user profile exists (using localStorage)
      await this.ensureUserProfile(user);

      return userSession.toObject();
    } catch (error) {
      console.error('❌ Error tracking sign-in:', error);
      throw error;
    }
  }

  // Track user sign-out
  public async trackSignOut(clerkId: string, sessionId?: string): Promise<void> {
    await this.initialize();

    try {
      // End all active sessions for the user using localStorage
      const activeSessions = UserSession.getActiveSessions(clerkId);
      let sessionsEnded = 0;

      activeSessions.forEach(sessionData => {
        const session = new UserSession(sessionData);
        session.endSession();
        sessionsEnded++;
      });

      console.log('✅ Sign-out tracked:', {
        clerkId,
        sessionsEnded,
      });
    } catch (error) {
      console.error('❌ Error tracking sign-out:', error);
      throw error;
    }
  }

  // Ensure user profile exists in localStorage
  private async ensureUserProfile(user: any): Promise<IUserProfile | null> {
    try {
      // Try to get existing user from localStorage first
      let existingUser = UserProfile.findOne({ clerkId: user.id });

      if (!existingUser) {
        // Create basic user profile if it doesn't exist
        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          preferences: {
            units: 'metric',
            notifications: true,
            privacy: 'private',
          },
          streak: {
            current: 0,
            longest: 0,
          },
        };

        // Only create if we have basic profile data, otherwise it will be created during onboarding
        if (userData.email) {
          const userProfile = new UserProfile(userData);
          await userProfile.save();
          console.log('✅ Basic user profile created:', user.id);
          return userProfile.toObject();
        }
      }

      return existingUser;
    } catch (error) {
      console.error('❌ Error ensuring user profile:', error);
      return null;
    }
  }

  // Get user sessions
  public async getUserSessions(clerkId: string, days: number = 30): Promise<IUserSession[]> {
    await this.initialize();

    try {
      const sessions = UserSession.getRecentSessions(clerkId, days);
      return sessions;
    } catch (error) {
      console.error('❌ Error fetching user sessions:', error);
      throw error;
    }
  }

  // Get active sessions
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

  // Get session statistics
  public async getSessionStats(clerkId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    lastSignIn: Date | null;
    signInMethods: Record<string, number>;
  }> {
    await this.initialize();

    try {
      // Calculate stats from localStorage sessions
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
export const authService = AuthService.getInstance();
