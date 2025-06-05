
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BirthdateSelectionProps {
  onBack: () => void;
  onContinue: () => void;
}

const BirthdateSelection = ({ onBack, onContinue }: BirthdateSelectionProps) => {
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Load saved data from localStorage only if user is continuing onboarding
  useEffect(() => {
    // Check if user has other onboarding data (indicating they're continuing)
    const hasOtherOnboardingData = localStorage.getItem("userHeight") ||
                                   localStorage.getItem("workoutFrequency") ||
                                   localStorage.getItem("goal") ||
                                   localStorage.getItem("gender");

    // Only load saved birthdate if user has other onboarding data
    if (hasOtherOnboardingData) {
      const savedBirthdate = localStorage.getItem("birthdate");
      if (savedBirthdate) {
        try {
          const parsedDate = JSON.parse(savedBirthdate);
          setMonth(parsedDate.month || "");
          setDay(parsedDate.day || "");
          setYear(parsedDate.year || "");
          console.log('📥 Loaded saved birthdate for continuing user');
        } catch (error) {
          console.error('Error parsing saved birthdate:', error);
        }
      }
    } else {
      console.log('🆕 New user - starting with empty birthdate selection');
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    if (month && day && year) {
      const birthdate = { month, day, year };
      localStorage.setItem("birthdate", JSON.stringify(birthdate));
    }
  }, [month, day, year]);

  const handleContinue = () => {
    if (month && day && year) {
      console.log("Birthdate:", { month, day, year });
      onContinue();
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const isFormValid = month && day && year;

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
          When were you born?
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 text-left mb-12 font-rubik leading-relaxed">
          This will be used to calibrate your custom plan.
        </p>

        {/* Date Selection Section */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-6 mb-12">
            {/* Date Inputs Row */}
            <div className="flex gap-4">
              {/* Month Dropdown */}
              <div className="flex-1">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full h-14 px-4 bg-gray-100 border border-gray-300 rounded-2xl text-lg font-rubik focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" disabled>Month</option>
                  {months.map((monthName, index) => (
                    <option key={monthName} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Dropdown */}
              <div className="flex-1">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full h-14 px-4 bg-gray-100 border border-gray-300 rounded-2xl text-lg font-rubik focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" disabled>Day</option>
                  {days.map((dayNum) => (
                    <option key={dayNum} value={dayNum}>
                      {dayNum}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div className="flex-1">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-14 px-4 bg-gray-100 border border-gray-300 rounded-2xl text-lg font-rubik focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" disabled>Year</option>
                  {years.map((yearNum) => (
                    <option key={yearNum} value={yearNum}>
                      {yearNum}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            disabled={!isFormValid}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BirthdateSelection;
