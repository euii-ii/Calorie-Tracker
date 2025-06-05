
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeightWeightProps {
  onBack: () => void;
  onContinue: () => void;
}

const HeightWeight = ({ onBack, onContinue }: HeightWeightProps) => {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  // Load saved data from localStorage only if user is continuing onboarding
  useEffect(() => {
    // Check if user has other onboarding data (indicating they're continuing)
    const hasOtherOnboardingData = localStorage.getItem("workoutFrequency") ||
                                   localStorage.getItem("goal") ||
                                   localStorage.getItem("gender");

    // Only load saved height/weight if user has other onboarding data
    if (hasOtherOnboardingData) {
      const savedHeight = localStorage.getItem("userHeight");
      const savedWeight = localStorage.getItem("userWeight");
      if (savedHeight) setHeight(savedHeight);
      if (savedWeight) setWeight(savedWeight);
      console.log('📥 Loaded saved height/weight for continuing user');
    } else {
      console.log('🆕 New user - starting with empty height/weight fields');
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    if (height) {
      localStorage.setItem("userHeight", height);
    }
  }, [height]);

  useEffect(() => {
    if (weight) {
      localStorage.setItem("userWeight", weight);
    }
  }, [weight]);

  const handleContinue = () => {
    if (height && weight) {
      console.log("Height:", height, "Weight:", weight);
      onContinue();
    }
  };

  // Generate height options from 140cm to 220cm
  const heightOptions = Array.from({ length: 81 }, (_, i) => 140 + i);
  
  // Generate weight options from 40kg to 150kg
  const weightOptions = Array.from({ length: 111 }, (_, i) => 40 + i);

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 sm:px-6 py-6 sm:py-8 font-rubik">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto flex flex-col flex-1">

        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-black text-left mb-3 sm:mb-4 font-manrope leading-tight">
          Height & weight
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-600 text-left mb-8 sm:mb-12 font-rubik leading-relaxed">
          This will be used to calibrate your custom plan.
        </p>

        {/* Input Section */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            {/* Height and Weight Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Height */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-medium text-black font-rubik">
                  Height
                </label>
                <Select value={height} onValueChange={setHeight}>
                  <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base bg-white border-gray-300 rounded-lg sm:rounded-xl font-rubik">
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-lg sm:rounded-xl shadow-lg max-h-48 sm:max-h-60">
                    {heightOptions.map((h) => (
                      <SelectItem
                        key={h}
                        value={h.toString()}
                        className="h-10 sm:h-12 text-sm sm:text-base font-rubik hover:bg-gray-50"
                      >
                        {h} cm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-medium text-black font-rubik">
                  Weight
                </label>
                <Select value={weight} onValueChange={setWeight}>
                  <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base bg-white border-gray-300 rounded-lg sm:rounded-xl font-rubik">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-lg sm:rounded-xl shadow-lg max-h-48 sm:max-h-60">
                    {weightOptions.map((w) => (
                      <SelectItem
                        key={w}
                        value={w.toString()}
                        className="h-10 sm:h-12 text-sm sm:text-base font-rubik hover:bg-gray-50"
                      >
                        {w} kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!height || !weight}
            className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeightWeight;
