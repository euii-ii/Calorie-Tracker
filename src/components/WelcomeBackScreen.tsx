import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, ArrowRight } from 'lucide-react';
import { apiService } from '@/services/apiService';

interface WelcomeBackScreenProps {
  onContinue: () => void;
}

const WelcomeBackScreen = ({ onContinue }: WelcomeBackScreenProps) => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update state when user data loads
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  // Test API connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await apiService.testConnection();
        console.log('🔗 API Connection test:', isConnected ? 'SUCCESS' : 'FAILED');
      } catch (error) {
        console.error('🔗 API Connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  const handleContinue = async () => {
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }

    if (firstName.trim().length < 2) {
      setError('First name must be at least 2 characters long');
      return;
    }

    if (lastName.trim() && lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store the names in localStorage for onboarding
      localStorage.setItem('userFirstName', firstName.trim());
      localStorage.setItem('userLastName', lastName.trim());

      // Create or update user in database with basic info
      if (user) {
        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        };

        try {
          console.log('🔄 Saving user data to database:', userData);
          console.log('🔧 API Service base URL:', apiService);

          // Test API connection first
          const isConnected = await apiService.testConnection();
          console.log('🔗 API Connection test:', isConnected);

          if (!isConnected) {
            console.warn('⚠️ API connection test failed, but proceeding with user creation...');
          }

          const result = await apiService.createOrUpdateUser(userData);
          console.log('✅ User basic info saved to database:', result);
        } catch (dbError: any) {
          console.error('⚠️ Failed to save to database:', dbError);
          console.error('⚠️ Error details:', {
            message: dbError.message,
            stack: dbError.stack,
            userData,
            apiUrl: import.meta.env.VITE_API_URL
          });

          // Don't throw error for database save failures during onboarding
          // Just log the error and continue
          console.warn('⚠️ Continuing onboarding despite database save failure');
        }
      }

      // Try to update Clerk user profile (optional - don't fail if this doesn't work)
      try {
        if (user) {
          await user.update({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });
          console.log('✅ Clerk user profile updated');
        }
      } catch (clerkError) {
        console.warn('⚠️ Failed to update Clerk profile, but continuing:', clerkError);
        // Don't fail the entire flow if Clerk update fails
      }

      console.log('✅ User name updated:', { firstName: firstName.trim(), lastName: lastName.trim() });

      // Continue to onboarding
      onContinue();
    } catch (err: any) {
      console.error('❌ Error updating user name:', err);
      setError(err.message || 'Failed to update your name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 font-rubik">
      <div className="w-full max-w-md mx-auto">
        
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black font-manrope mb-2">
            Welcome to Cal AI!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-rubik">
            You're successfully signed in. Let's personalize your experience.
          </p>
        </div>

        <Card className="border-2 border-black bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-black font-manrope">
              Tell us your name
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 font-rubik">
              This helps us create a personalized experience for you
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black font-rubik">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your first name"
                    className="pl-10 h-12 border-gray-300 rounded-lg font-rubik focus:border-black focus:ring-black"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black font-rubik">
                  Last Name (Optional)
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your last name"
                  className="h-12 border-gray-300 rounded-lg font-rubik focus:border-black focus:ring-black"
                />
              </div>
            </div>

            {/* User Info Display */}
            {user?.primaryEmailAddress && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 font-rubik">
                  <span className="font-medium">Email:</span> {user.primaryEmailAddress.emailAddress}
                </p>
                {user.createdAt && (
                  <p className="text-sm text-gray-600 font-rubik mt-1">
                    <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={isLoading || !firstName.trim()}
              className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all duration-200 transform active:scale-95 font-rubik disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Continue to Profile Setup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>

            {/* Progress Indicator */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <div className="w-8 h-1 bg-gray-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-1 bg-gray-200 rounded"></div>
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-500 font-rubik">
                Step 1 of 7 - Personal Information
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 font-rubik">
            Your information is secure and will only be used to personalize your nutrition plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackScreen;
