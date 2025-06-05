
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Apple, Wheat, Droplets } from "lucide-react";

interface NutritionResult {
  id: string;
  description: string;
  health_suggestion: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  date: string;
  timestamp: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as NutritionResult;

  if (!result) {
    navigate('/dashboard');
    return null;
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center p-4 bg-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToDashboard}
          className="mr-4"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-black">Food Analysis</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Food Description */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-black mb-3">What we found</h2>
            <p className="text-gray-700 leading-relaxed">{result.description}</p>
          </CardContent>
        </Card>

        {/* Health Suggestion */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-black mb-3">Health Suggestion</h2>
            <p className="text-gray-700 leading-relaxed">{result.health_suggestion}</p>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Nutrition Breakdown</h2>
            
            {/* Calories */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Calories</span>
                <span className="text-2xl font-bold text-black">{result.calories}</span>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset="0"
                      className="text-red-400 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Apple size={16} className="text-red-400" />
                  </div>
                </div>
                <div className="font-bold text-black">{result.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>

              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset="0"
                      className="text-orange-400 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wheat size={16} className="text-orange-400" />
                  </div>
                </div>
                <div className="font-bold text-black">{result.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>

              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset="0"
                      className="text-blue-400 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="font-bold text-black">{result.fats}g</div>
                <div className="text-sm text-gray-600">Fats</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={handleBackToDashboard}
          className="w-full bg-black hover:bg-gray-800 text-white"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Results;
