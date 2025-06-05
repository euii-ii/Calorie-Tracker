
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GoalSelectionProps {
  onBack: () => void;
  onContinue: () => void;
}

const GoalSelection = ({ onBack, onContinue }: GoalSelectionProps) => {
  const [selectedGoal, setSelectedGoal] = useState<string>("");

  // Load saved data from localStorage only if user is continuing onboarding
  useEffect(() => {
    // Check if user has other onboarding data (indicating they're continuing)
    const hasOtherOnboardingData = localStorage.getItem("userHeight") ||
                                   localStorage.getItem("workoutFrequency") ||
                                   localStorage.getItem("gender");

    // Only load saved goal if user has other onboarding data
    if (hasOtherOnboardingData) {
      const savedGoal = localStorage.getItem("goal");
      if (savedGoal) setSelectedGoal(savedGoal);
      console.log('📥 Loaded saved goal for continuing user');
    } else {
      console.log('🆕 New user - starting with empty goal selection');
    }
  }, []);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (selectedGoal) {
      localStorage.setItem("goal", selectedGoal);
    }
  }, [selectedGoal]);

  const handleContinue = () => {
    if (selectedGoal) {
      console.log("Goal:", selectedGoal);
      onContinue();
    }
  };

  const goalOptions = [
    {
      value: "lose",
      title: "Lose weight"
    },
    {
      value: "maintain",
      title: "Maintain"
    },
    {
      value: "gain",
      title: "Gain weight"
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8 font-rubik">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
        
        {/* Back Button */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6 text-black" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-black text-left mb-4 font-manrope leading-tight">
          What is your goal?
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 text-left mb-12 font-rubik leading-relaxed">
          This helps us generate a plan for your calorie intake.
        </p>

        {/* Options Section */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-4 mb-12">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedGoal(option.value)}
                className={`w-full p-6 rounded-2xl text-left transition-all duration-200 font-rubik ${
                  selectedGoal === option.value
                    ? "bg-gray-100 border-2 border-black"
                    : "bg-gray-100 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <div className="text-xl font-semibold text-black">
                  {option.title}
                </div>
              </button>
            ))}
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;
