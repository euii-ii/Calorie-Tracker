
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateNutrition } from "@/utils/nutritionCalculator";
import { useNavigate } from "react-router-dom";
import { geminiService } from "@/services/geminiService";
import { Loader2, Brain, Heart, Target, AlertTriangle } from "lucide-react";

interface CustomPlanProps {
  onBack: () => void;
  onContinue: () => void;
}

interface UserData {
  height: string;
  weight: string;
  birthdate: {
    month: string;
    day: string;
    year: string;
  };
  workoutFrequency: string;
  goal: string;
  gender: string;
}

interface AIAnalysis {
  healthAssessment: string;
  personalizedTips: string[];
  warnings: string[];
  motivationalMessage: string;
  nutritionRecommendations: string;
  exerciseRecommendations: string;
  lifestyleAdvice: string;
}

const CustomPlan = ({ onBack, onContinue }: CustomPlanProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true); // Start with true to prevent initial glitch
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Get user data from localStorage (saved during onboarding)
  const getUserData = (): UserData => {
    // Try to get consolidated data first (for backward compatibility)
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Using consolidated onboarding data:', parsedData);
        return parsedData;
      } catch (error) {
        console.error('Error parsing consolidated onboarding data:', error);
      }
    }

    // Get data from individual localStorage keys (current implementation)
    const height = localStorage.getItem('userHeight') || "";
    const weight = localStorage.getItem('userWeight') || "";
    const workoutFrequency = localStorage.getItem('workoutFrequency') || "";
    const goal = localStorage.getItem('goal') || "";
    const gender = localStorage.getItem('gender') || "";

    // Get birthdate object
    let birthdate = { month: "", day: "", year: "" };
    const savedBirthdate = localStorage.getItem('birthdate');
    if (savedBirthdate) {
      try {
        birthdate = JSON.parse(savedBirthdate);
      } catch (error) {
        console.error('Error parsing birthdate:', error);
      }
    }

    const userData = {
      height,
      weight,
      birthdate,
      workoutFrequency,
      goal,
      gender
    };

    console.log('Using individual localStorage keys for user data:', userData);

    // Save consolidated data for future use
    if (height && weight && workoutFrequency && goal && gender && birthdate.month && birthdate.day && birthdate.year) {
      localStorage.setItem('onboardingData', JSON.stringify(userData));
      console.log('Saved consolidated onboarding data for future use');
    }

    return userData;
  };

  const userData = getUserData();
  console.log('Using userData for calculation:', userData);

  // Only calculate nutrition if we have valid user data
  const nutritionResults = userData.height && userData.weight ? calculateNutrition(userData) : null;

  // Get AI analysis when nutrition results are available
  useEffect(() => {
    const getAIAnalysis = async () => {
      console.log('🔍 AI Analysis Check:', {
        hasNutritionResults: !!nutritionResults,
        hasHeight: !!userData.height,
        hasWeight: !!userData.weight,
        hasBirthdate: !!(userData.birthdate?.year && userData.birthdate?.month && userData.birthdate?.day),
        hasGoal: !!userData.goal,
        hasGender: !!userData.gender,
        hasWorkoutFreq: !!userData.workoutFrequency,
        hasStartedAnalysis
      });

      // Validate all required data
      if (!nutritionResults || !userData.height || !userData.weight ||
          !userData.birthdate?.year || !userData.birthdate?.month || !userData.birthdate?.day ||
          !userData.goal || !userData.gender || !userData.workoutFrequency) {
        console.log('❌ Missing required data for AI analysis');
        console.log('Missing data details:', {
          nutritionResults: !!nutritionResults,
          height: userData.height,
          weight: userData.weight,
          birthdate: userData.birthdate,
          goal: userData.goal,
          gender: userData.gender,
          workoutFrequency: userData.workoutFrequency
        });
        setIsAnalyzing(false);
        return;
      }

      // Only set analyzing to true if we haven't started yet
      if (!hasStartedAnalysis) {
        setHasStartedAnalysis(true);
        setIsAnalyzing(true);
        console.log('🤖 Starting AI analysis...');
      }

      try {
        console.log('📤 Sending data to Gemini API...', { userData, nutritionResults });

        // Test Gemini service first
        console.log('🔗 Testing Gemini API connection...');

        const analysis = await geminiService.analyzeUserProfile(userData, nutritionResults);

        console.log('✅ AI analysis received successfully:', analysis);
        setAiAnalysis(analysis);

        // Save AI analysis to localStorage immediately for dashboard access
        localStorage.setItem('aiAnalysis', JSON.stringify(analysis));
        localStorage.setItem('aiAnalysisDate', new Date().toDateString());
        console.log('💾 AI analysis saved to localStorage for dashboard');

        // Also save to localStorage for debugging
        localStorage.setItem('lastAiAnalysis', JSON.stringify(analysis));
      } catch (error) {
        console.error('❌ Error getting AI analysis:', error);
        console.error('❌ Error type:', error.constructor.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Check specific error types
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log('🚫 Rate limit or quota exceeded - using enhanced fallback');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          console.log('🌐 Network error - using fallback');
        } else if (error.message.includes('API key')) {
          console.log('🔑 API key error - using fallback');
        }

        // Set a comprehensive fallback analysis
        const fallbackAnalysis = {
          healthAssessment: `Based on your profile (${userData.height}cm, ${userData.weight}kg, ${userData.goal} goal), your nutrition plan has been calculated using proven scientific methods. Your daily calorie target of ${nutritionResults.calories} calories is designed to help you achieve your goals safely and effectively.`,
          personalizedTips: [
            "Stay consistent with your nutrition plan for best results",
            "Track your progress weekly, not daily, to see meaningful changes",
            "Stay hydrated - aim for 8-10 glasses of water per day",
            "Get 7-9 hours of quality sleep to support your goals",
            "Include a variety of whole foods in your diet"
          ],
          warnings: userData.goal === 'lose' && nutritionResults.calories < 1200 ?
            ["Very low calorie diets should be supervised by a healthcare professional"] : [],
          motivationalMessage: `You're taking a great step towards your health goals! With your ${userData.workoutFrequency} workout frequency and personalized nutrition plan, you're well-equipped for success.`,
          nutritionRecommendations: `Focus on hitting your macro targets: ${nutritionResults.protein}g protein, ${nutritionResults.carbs}g carbs, and ${nutritionResults.fats}g fats daily. Prioritize whole foods and maintain consistent meal timing.`,
          exerciseRecommendations: `With your current ${userData.workoutFrequency} workout schedule, combine strength training with cardio for optimal results. Adjust intensity based on your energy levels and recovery.`,
          lifestyleAdvice: "Consistency is more important than perfection. Make gradual changes that you can maintain long-term, and don't be too hard on yourself if you have off days."
        };

        setAiAnalysis(fallbackAnalysis);

        // Save fallback analysis to localStorage immediately for dashboard access
        localStorage.setItem('aiAnalysis', JSON.stringify(fallbackAnalysis));
        localStorage.setItem('aiAnalysisDate', new Date().toDateString());
        console.log('💾 Fallback AI analysis saved to localStorage for dashboard');
      } finally {
        setIsAnalyzing(false);
        console.log('🏁 AI analysis process completed');
      }
    };

    // Add a small delay to prevent immediate state changes
    const timer = setTimeout(() => {
      getAIAnalysis();
    }, 500); // Increased delay to ensure all data is loaded

    return () => clearTimeout(timer);
  }, [nutritionResults, userData, hasStartedAnalysis]);

  // Debug function to test AI analysis manually
  const testAIAnalysis = async () => {
    setDebugInfo('Testing AI analysis...');
    try {
      // Test API connection first
      const isConnected = await geminiService.testConnection();
      setDebugInfo(prev => prev + `\nAPI Connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);

      if (!isConnected) {
        setDebugInfo(prev => prev + '\nAPI connection failed - check API key and network');
        return;
      }

      // Test full analysis
      setDebugInfo(prev => prev + '\nTesting full profile analysis...');
      const analysis = await geminiService.analyzeUserProfile(userData, nutritionResults!);
      setDebugInfo(prev => prev + `\nAnalysis SUCCESS: ${analysis.healthAssessment.substring(0, 100)}...`);
      setAiAnalysis(analysis);
    } catch (error: any) {
      setDebugInfo(prev => prev + `\nAnalysis FAILED: ${error.message}`);
      console.error('Manual test failed:', error);
    }
  };

  const handleGetStarted = async () => {
    if (!nutritionResults) {
      console.error('Cannot proceed without nutrition results');
      return;
    }

    setIsLoading(true);

    // Set logged in state and save nutrition plan
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('nutritionPlan', JSON.stringify(nutritionResults));

    // Save AI analysis if available
    if (aiAnalysis) {
      localStorage.setItem('aiAnalysis', JSON.stringify(aiAnalysis));
      console.log('Saved AI analysis to localStorage:', aiAnalysis);
    }

    console.log('Saved nutrition plan to localStorage:', nutritionResults);

    // Small delay for better UX
    setTimeout(() => {
      setIsLoading(false);
      // Call onContinue to trigger onboarding completion check
      onContinue();
    }, 500);
  };

  // Show error if no user data
  if (!userData.height || !userData.weight) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 font-rubik">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Oops!</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find your profile data. Please go back and complete the onboarding process.
          </p>
          <Button 
            onClick={onBack}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold font-rubik"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Show error if nutrition calculation failed
  if (!nutritionResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 font-rubik">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Calculation Error</h1>
          <p className="text-gray-600 mb-8">
            We couldn't calculate your nutrition plan. Please try again.
          </p>
          <Button 
            onClick={onBack}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold font-rubik"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8 font-rubik">
      <div className="w-full max-w-md mx-auto flex-1">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 font-manrope">
            Your Custom Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your personalized nutrition plan based on your goals
          </p>
        </div>

        {/* Main Results Card */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-black">Daily Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Calories */}
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">
                {nutritionResults.calories}
              </div>
              <div className="text-gray-600 font-medium">Calories per day</div>
            </div>

            <Separator />

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-500 mb-1">
                  {nutritionResults.protein}g
                </div>
                <div className="text-sm text-gray-600 font-medium">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {nutritionResults.carbs}g
                </div>
                <div className="text-sm text-gray-600 font-medium">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {nutritionResults.fats}g
                </div>
                <div className="text-sm text-gray-600 font-medium">Fats</div>
              </div>
            </div>

            {nutritionResults.weightLossGoal && (
              <>
                <Separator />
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    Weekly Goal: {nutritionResults.debugInfo.calculatedValues.weeklyGoal}
                  </div>
                  <div className="text-sm text-gray-600">
                    Target Date: {nutritionResults.targetDate}
                  </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* AI Analysis Section - Stable container with smooth transitions */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-500 ease-in-out">
          <div className="min-h-[400px] relative overflow-hidden">
            {/* Loading State */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              isAnalyzing ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}>
              <CardContent className="p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div className="text-lg font-medium text-gray-700">
                      AI is analyzing your profile...
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Getting personalized insights and recommendations
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Content State */}
            <div className={`transition-all duration-500 ease-in-out ${
              !isAnalyzing && aiAnalysis ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}>
              {aiAnalysis && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                      <Brain className="h-6 w-6 text-blue-500" />
                      AI Health Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">

              {/* Health Assessment */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Health Assessment</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{aiAnalysis.healthAssessment}</p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {aiAnalysis.warnings.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">Important Notes</h4>
                      <ul className="space-y-1">
                        {aiAnalysis.warnings.map((warning, index) => (
                          <li key={index} className="text-amber-700 text-sm">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Personalized Tips */}
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Personalized Tips</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.personalizedTips.map((tip, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
                <div className="text-center">
                  <h4 className="font-semibold text-purple-800 mb-2">💪 Your Motivation</h4>
                  <p className="text-purple-700 text-sm italic leading-relaxed">"{aiAnalysis.motivationalMessage}"</p>
                </div>
              </div>

                  </CardContent>
                </>
              )}
            </div>

            {/* Placeholder State */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              !isAnalyzing && !aiAnalysis ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}>
              <CardContent className="p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">AI analysis will appear here</div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Detailed AI Recommendations - Smooth transitions */}
        <Card className="mb-6 shadow-sm border-0 transition-all duration-500 ease-in-out">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">Detailed Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="relative min-h-[250px] overflow-hidden">
            {/* Content State */}
            <div className={`transition-all duration-500 ease-in-out ${
              aiAnalysis ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}>
              {aiAnalysis && (
                <div className="space-y-4">
                  {/* Nutrition Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      🥗 Nutrition Advice
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.nutritionRecommendations}</p>
                  </div>

                  <Separator />

                  {/* Exercise Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      🏋️ Exercise Guidance
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.exerciseRecommendations}</p>
                  </div>

                  <Separator />

                  {/* Lifestyle Advice */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      🌟 Lifestyle Tips
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.lifestyleAdvice}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder State */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              !aiAnalysis ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}>
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-sm">Detailed recommendations will appear after AI analysis</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Debug Section */}
        <Card className="mb-6 shadow-sm border-0 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">AI Analysis Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testAIAnalysis}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Test AI Analysis Manually
            </Button>
            {debugInfo && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="mb-8 shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">Calculation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            
            {/* Input Values */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Your Information</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>Height: {nutritionResults.debugInfo.inputValues.height}</div>
                <div>Weight: {nutritionResults.debugInfo.inputValues.weight}</div>
                <div>Age: {nutritionResults.debugInfo.inputValues.age} years</div>
                <div>Gender: {nutritionResults.debugInfo.inputValues.gender}</div>
                <div>Activity: {nutritionResults.debugInfo.inputValues.workoutFrequency} days/week</div>
                <div>Goal: {nutritionResults.debugInfo.inputValues.goal}</div>
              </div>
            </div>

            <Separator />

            {/* Calculated Values */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Calculations</h4>
              <div className="space-y-1 text-gray-600">
                <div>BMR (Base Metabolic Rate): {nutritionResults.debugInfo.calculatedValues.bmr} cal</div>
                <div>TDEE (Total Daily Energy): {nutritionResults.debugInfo.calculatedValues.tdee} cal</div>
                <div>Target Calories: {nutritionResults.debugInfo.calculatedValues.targetCalories} cal</div>
              </div>
            </div>

            <Separator />

            {/* Macro Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Macro Breakdown</h4>
              <div className="space-y-1 text-gray-600">
                <div>Protein: {nutritionResults.debugInfo.macronutrientCalculations.protein.grams}g ({nutritionResults.debugInfo.macronutrientCalculations.protein.calories} cal)</div>
                <div>Fats: {nutritionResults.debugInfo.macronutrientCalculations.fats.grams}g ({nutritionResults.debugInfo.macronutrientCalculations.fats.calories} cal)</div>
                <div>Carbs: {nutritionResults.debugInfo.macronutrientCalculations.carbs.grams}g ({nutritionResults.debugInfo.macronutrientCalculations.carbs.calories} cal)</div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Bottom Buttons */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <Button 
          onClick={handleGetStarted}
          disabled={isLoading}
          className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik"
        >
          {isLoading ? "Setting up..." : "Let's get started!"}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full h-12 border-gray-300 text-gray-700 rounded-2xl text-base font-medium transition-all duration-200 font-rubik"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default CustomPlan;
