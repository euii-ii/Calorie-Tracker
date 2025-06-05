import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import WelcomeScreen from "./WelcomeScreen";
import WelcomeBackScreen from "./WelcomeBackScreen";
import ValueProposition from "./ValueProposition";
import HeightWeight from "./HeightWeight";
import WorkoutFrequency from "./WorkoutFrequency";
import GoalSelection from "./GoalSelection";
import GenderSelection from "./GenderSelection";
import BirthdateSelection from "./BirthdateSelection";
import CustomPlan from "./CustomPlan";
import { apiService } from "@/services/apiService";

interface OnboardingFlowProps {
  onOnboardingComplete?: () => void;
}

const OnboardingFlow = ({ onOnboardingComplete }: OnboardingFlowProps) => {
  const { user, isSignedIn } = useUser();
  const [currentStep, setCurrentStep] = useState<"welcome" | "welcome-back" | "value-proposition" | "height-weight" | "workout-frequency" | "goal-selection" | "gender-selection" | "birthdate-selection" | "custom-plan">("welcome");
  const [isNewUser, setIsNewUser] = useState<boolean>(true);

  // Check if user is new and clear localStorage for fresh start
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      try {
        // Check if user exists in database
        const existingUser = await apiService.getUser(user.id);

        if (existingUser && existingUser.profileData) {
          // User exists and has profile data - they're returning
          setIsNewUser(false);
          console.log('👤 Returning user detected - preserving any existing onboarding data');
        } else {
          // New user - clear any stale localStorage data
          setIsNewUser(true);
          console.log('🆕 New user detected - clearing localStorage for fresh start');

          // Clear all onboarding-related localStorage items
          const onboardingKeys = [
            'userHeight', 'userWeight', 'workoutFrequency', 'goal',
            'gender', 'birthdate', 'nutritionPlan', 'isLoggedIn',
            'userFirstName', 'userLastName', 'onboardingData',
            'aiAnalysis', 'aiAnalysisDate'
          ];

          onboardingKeys.forEach(key => {
            localStorage.removeItem(key);
          });

          console.log('✅ localStorage cleared for new user');
        }
      } catch (error) {
        // If user doesn't exist in database, treat as new user
        console.log('🆕 User not found in database - treating as new user');
        setIsNewUser(true);

        // Clear localStorage for new user
        const onboardingKeys = [
          'userHeight', 'userWeight', 'workoutFrequency', 'goal',
          'gender', 'birthdate', 'nutritionPlan', 'isLoggedIn',
          'userFirstName', 'userLastName', 'onboardingData',
          'aiAnalysis', 'aiAnalysisDate'
        ];

        onboardingKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }
    };

    checkUserStatus();
  }, [user]);

  const handleGetStarted = () => {
    console.log('🔍 handleGetStarted called - isSignedIn:', isSignedIn, 'user:', !!user);
    console.log('🔍 User details:', user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : 'No user');

    if (isSignedIn && user) {
      console.log("✅ Signed-in user clicked Get Started - moving to welcome-back");
      setCurrentStep("welcome-back");
    } else {
      console.log("❌ Non-signed-in user clicked Get Started - moving to value proposition");
      setCurrentStep("value-proposition");
    }
  };



  const handleContinueFromWelcomeBack = () => {
    console.log("Moving from welcome-back to value proposition");
    setCurrentStep("value-proposition");
  };

  const handleBackToWelcomeBack = () => {
    console.log("Going back to welcome-back");
    setCurrentStep("welcome-back");
  };

  const handleContinueToHeightWeight = () => {
    console.log("Moving to height & weight");
    setCurrentStep("height-weight");
  };

  const handleBackToValueProposition = () => {
    console.log("Going back to value proposition");
    setCurrentStep("value-proposition");
  };

  const handleContinueToWorkoutFrequency = () => {
    console.log("Moving to workout frequency");
    setCurrentStep("workout-frequency");
  };

  const handleBackToHeightWeight = () => {
    console.log("Going back to height & weight");
    setCurrentStep("height-weight");
  };

  const handleContinueToGoalSelection = () => {
    console.log("Moving to goal selection");
    setCurrentStep("goal-selection");
  };

  const handleBackToWorkoutFrequency = () => {
    console.log("Going back to workout frequency");
    setCurrentStep("workout-frequency");
  };

  const handleContinueToGenderSelection = () => {
    console.log("Moving to gender selection");
    setCurrentStep("gender-selection");
  };

  const handleBackToGoalSelection = () => {
    console.log("Going back to goal selection");
    setCurrentStep("goal-selection");
  };

  const handleContinueFromGenderSelection = () => {
    console.log("Moving to birthdate selection");
    setCurrentStep("birthdate-selection");
  };

  const handleBackToGenderSelection = () => {
    console.log("Going back to gender selection");
    setCurrentStep("gender-selection");
  };

  const handleContinueFromBirthdateSelection = () => {
    console.log("Moving to custom plan");
    setCurrentStep("custom-plan");
  };

  const handleBackToBirthdateSelection = () => {
    console.log("Going back to birthdate selection");
    setCurrentStep("birthdate-selection");
  };

  const handleContinueFromCustomPlan = async () => {
    console.log("Continue from custom plan - app complete!");

    // Save onboarding data to database immediately after completion
    if (isSignedIn && user) {
      await saveOnboardingDataToDatabase();
    }

    // Trigger re-check of onboarding completion
    if (onOnboardingComplete) {
      onOnboardingComplete();
    }
  };

  // Function to save onboarding data to database
  const saveOnboardingDataToDatabase = async () => {
    try {
      console.log('💾 Saving onboarding data to database...');

      // Get all onboarding data from localStorage
      const height = localStorage.getItem('userHeight');
      const weight = localStorage.getItem('userWeight');
      const workoutFrequency = localStorage.getItem('workoutFrequency');
      const goal = localStorage.getItem('goal');
      const gender = localStorage.getItem('gender');
      const birthdate = localStorage.getItem('birthdate');
      const nutritionPlan = localStorage.getItem('nutritionPlan');

      // Validate that we have all required data
      if (!height || !weight || !workoutFrequency || !goal || !gender || !birthdate || !nutritionPlan) {
        console.error('❌ Missing required onboarding data for database save');
        return;
      }

      // Parse the data
      const birthDate = JSON.parse(birthdate);
      const nutritionData = JSON.parse(nutritionPlan);
      const age = new Date().getFullYear() - parseInt(birthDate.year);

      // Prepare user data for database
      const userData = {
        clerkId: user!.id,
        email: user!.primaryEmailAddress?.emailAddress || user!.emailAddresses?.[0]?.emailAddress || '',
        firstName: user!.firstName || '',
        lastName: user!.lastName || '',
        profileData: {
          height: parseInt(height),
          weight: parseInt(weight),
          age,
          gender: gender as 'male' | 'female' | 'other',
          activityLevel: workoutFrequency,
          goal: goal as 'lose' | 'maintain' | 'gain',
          workoutFrequency,
        },
        nutritionPlan: {
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fats: nutritionData.fats,
          generatedAt: new Date(),
        },
      };

      // Save to MongoDB database via API
      await apiService.createOrUpdateUser(userData);
      console.log('✅ Onboarding data successfully saved to MongoDB database');

    } catch (error) {
      console.error('❌ Error saving onboarding data to database:', error);
    }
  };

  if (currentStep === "welcome") {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (currentStep === "welcome-back") {
    return <WelcomeBackScreen onContinue={handleContinueFromWelcomeBack} />;
  }

  if (currentStep === "value-proposition") {
    return (
      <ValueProposition
        onBack={handleBackToWelcomeBack}
        onContinue={handleContinueToHeightWeight}
      />
    );
  }

  if (currentStep === "height-weight") {
    return (
      <HeightWeight
        onBack={handleBackToValueProposition}
        onContinue={handleContinueToWorkoutFrequency}
      />
    );
  }

  if (currentStep === "workout-frequency") {
    return (
      <WorkoutFrequency
        onBack={handleBackToHeightWeight}
        onContinue={handleContinueToGoalSelection}
      />
    );
  }

  if (currentStep === "goal-selection") {
    return (
      <GoalSelection
        onBack={handleBackToWorkoutFrequency}
        onContinue={handleContinueToGenderSelection}
      />
    );
  }

  if (currentStep === "gender-selection") {
    return (
      <GenderSelection
        onBack={handleBackToGoalSelection}
        onContinue={handleContinueFromGenderSelection}
      />
    );
  }

  if (currentStep === "birthdate-selection") {
    return (
      <BirthdateSelection
        onBack={handleBackToGenderSelection}
        onContinue={handleContinueFromBirthdateSelection}
      />
    );
  }

  if (currentStep === "custom-plan") {
    return (
      <CustomPlan
        onBack={handleBackToBirthdateSelection}
        onContinue={handleContinueFromCustomPlan}
      />
    );
  }

  return null;
};

export default OnboardingFlow;
