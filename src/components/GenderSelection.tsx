
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GenderSelectionProps {
  onBack: () => void;
  onContinue: () => void;
}

const GenderSelection = ({ onBack, onContinue }: GenderSelectionProps) => {
  const [selectedGender, setSelectedGender] = useState<string>("");

  // Load saved data from localStorage only if user is continuing onboarding
  useEffect(() => {
    // Check if user has other onboarding data (indicating they're continuing)
    const hasOtherOnboardingData = localStorage.getItem("userHeight") ||
                                   localStorage.getItem("workoutFrequency") ||
                                   localStorage.getItem("goal");

    // Only load saved gender if user has other onboarding data
    if (hasOtherOnboardingData) {
      const savedGender = localStorage.getItem("gender");
      if (savedGender) setSelectedGender(savedGender);
      console.log('📥 Loaded saved gender for continuing user');
    } else {
      console.log('🆕 New user - starting with empty gender selection');
    }
  }, []);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (selectedGender) {
      localStorage.setItem("gender", selectedGender);
    }
  }, [selectedGender]);

  const handleContinue = () => {
    if (selectedGender) {
      console.log("Gender:", selectedGender);
      onContinue();
    }
  };

  const genderOptions = [
    {
      value: "male",
      title: "Male"
    },
    {
      value: "female",
      title: "Female"
    },
    {
      value: "other",
      title: "Other"
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
          Choose your Gender
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 text-left mb-12 font-rubik leading-relaxed">
          This will be used to calibrate your custom plan.
        </p>

        {/* Options Section */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-4 mb-12">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedGender(option.value)}
                className={`w-full p-6 rounded-2xl text-left transition-all duration-200 font-rubik ${
                  selectedGender === option.value
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
            disabled={!selectedGender}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenderSelection;
