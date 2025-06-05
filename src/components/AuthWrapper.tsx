import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiService } from '@/services/apiService';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Helper functions for device detection
const detectSignInMethod = (user: any): string => {
  // Check if user has external accounts (Google, GitHub, etc.)
  if (user.externalAccounts && user.externalAccounts.length > 0) {
    const provider = user.externalAccounts[0].provider;
    return provider || 'email';
  }
  return 'email';
};

const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
};

const detectBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

const detectOS = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

const getClientIP = async (): Promise<string> => {
  try {
    // Use a simple IP detection service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    console.warn('Could not detect IP address:', error);
    return 'Unknown';
  }
};

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const hasTrackedSignIn = useRef(false);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (!isLoaded) {
        console.log('🔄 Clerk authentication loading...');
        return;
      }

      if (isSignedIn && user && !hasTrackedSignIn.current) {
        console.log('🔐 New user authentication detected:', {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        });

        try {
          // Track sign-in to MongoDB via API
          const sessionData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            sessionId: user.lastSignInAt ? user.lastSignInAt.toString() : undefined,
            signInMethod: detectSignInMethod(user),
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent,
            location: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            deviceInfo: {
              type: detectDeviceType(),
              browser: detectBrowser(),
              os: detectOS(),
            },
            signInTime: new Date(),
            isActive: true,
          };

          await apiService.createSession(sessionData);
          hasTrackedSignIn.current = true;
          console.log('✅ Sign-in successfully tracked to MongoDB via API');

          // Also create/update user profile in MongoDB
          const userData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          };

          await apiService.createOrUpdateUser(userData);
          console.log('✅ User profile created/updated in MongoDB');
        } catch (error) {
          console.error('❌ Error tracking sign-in to MongoDB:', error);
        }
      } else if (isLoaded && !isSignedIn && hasTrackedSignIn.current) {
        console.log('🔓 User signed out - resetting tracking flag');
        hasTrackedSignIn.current = false;
      }
    };

    handleAuthStateChange();
  }, [isSignedIn, isLoaded, user]);

  return <>{children}</>;
};

export default AuthWrapper;
