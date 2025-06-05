import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import OnboardingFlow from "../components/OnboardingFlow";
import { databaseService } from "@/services/databaseService";

const Index = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  const handleOnboardingComplete = () => {
    console.log('🎉 Onboarding completed - redirecting to dashboard');
    navigate('/dashboard');
  };

  useEffect(() => {
    console.log('🔍 Index useEffect - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);

    // Wait for Clerk to fully load before making any decisions
    if (!isLoaded) {
      console.log('🔄 Waiting for Clerk authentication to load...');
      return;
    }

    // Check onboarding completion for signed-in users
    if (isSignedIn && user && !isCheckingOnboarding) {
      console.log('👤 User is signed in - checking onboarding completion...');
      setIsCheckingOnboarding(true);

      const checkOnboardingCompletion = async () => {
        try {
          console.log('🔄 Checking onboarding completion for user:', user.id);

          // Get user profile from database
          const userProfile = await databaseService.getUserProfile(user.id);

          if (userProfile && userProfile.profileData && userProfile.nutritionPlan) {
            console.log('✅ User has completed onboarding - loading profile data and redirecting to dashboard');

            // Store profile data in localStorage for the app to use
            const profileData = {
              userHeight: userProfile.profileData.height?.toString() || '',
              userWeight: userProfile.profileData.weight?.toString() || '',
              workoutFrequency: userProfile.profileData.workoutFrequency || '',
              goal: userProfile.profileData.goal || '',
              gender: userProfile.profileData.gender || '',
              isLoggedIn: 'true'
            };

            // Store nutrition plan
            if (userProfile.nutritionPlan) {
              localStorage.setItem('nutritionPlan', JSON.stringify(userProfile.nutritionPlan));
            }

            // Store each piece of profile data
            Object.entries(profileData).forEach(([key, value]) => {
              if (value !== null && value !== undefined && value !== '') {
                localStorage.setItem(key, value);
              }
            });

            navigate('/dashboard');
          } else {
            console.log('❌ User has not completed onboarding - will show onboarding flow');
            setIsCheckingOnboarding(false);
          }
        } catch (error) {
          console.error('❌ Error checking onboarding completion:', error);
          setIsCheckingOnboarding(false);
        }
      };

      checkOnboardingCompletion();
    }
  }, [isSignedIn, isLoaded, navigate, user, isCheckingOnboarding]);

  // Show loading state while Clerk is initializing or checking onboarding
  if (!isLoaded || (isSignedIn && isCheckingOnboarding)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isLoaded ? 'Loading...' : 'Checking your profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Show the onboarding flow
  return <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />;
};

export default Index;