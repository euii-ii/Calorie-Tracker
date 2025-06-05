import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, CalendarIcon, User, Target, Activity, Brain, Lightbulb, ChefHat, AlertCircle, Heart, AlertTriangle } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { format } from "date-fns";
import { geminiService } from "@/services/geminiService";
import { databaseService } from "@/services/databaseService";
import { authService } from "@/services/authService";
import { IUserProfile } from "@/models/User";
import { IFoodLog } from "@/models/FoodLog";

interface NutritionLog {
  id: string;
  description: string;
  health_suggestion?: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  date: string;
  timestamp: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCamera, setShowCamera] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [streak, setStreak] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [foodAnalysis, setFoodAnalysis] = useState<any>(null);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);

  // Database-related state
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isLoadingFromDatabase, setIsLoadingFromDatabase] = useState(false);
  const [databaseLogs, setDatabaseLogs] = useState<IFoodLog[]>([]);

  // Check if user has completed onboarding - redirect if not
  useEffect(() => {
    // Wait for Clerk to fully load before checking authentication
    if (!isLoaded) {
      console.log('🔄 Waiting for Clerk authentication to load in Dashboard...');
      return;
    }

    // If user is not signed in, redirect to home
    if (!isSignedIn) {
      console.log('❌ User not signed in - redirecting to home');
      navigate('/');
      return;
    }

    const checkOnboardingCompletion = () => {
      const nutritionPlan = localStorage.getItem('nutritionPlan');
      const userHeight = localStorage.getItem('userHeight');
      const userWeight = localStorage.getItem('userWeight');
      const workoutFrequency = localStorage.getItem('workoutFrequency');
      const goal = localStorage.getItem('goal');
      const gender = localStorage.getItem('gender');
      const birthdate = localStorage.getItem('birthdate');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      const hasCompleteProfile = userHeight && userWeight && workoutFrequency && goal && gender && birthdate;
      const hasNutritionPlan = nutritionPlan && isLoggedIn === 'true';

      if (!hasCompleteProfile || !hasNutritionPlan) {
        console.log('❌ Incomplete onboarding detected in Dashboard - redirecting to home');
        navigate('/');
        return;
      }

      console.log('✅ Complete onboarding confirmed - Dashboard access allowed');
    };

    checkOnboardingCompletion();
  }, [navigate, isLoaded, isSignedIn]);

  // Initialize database connection and sync user data
  useEffect(() => {
    const initializeDatabase = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        setIsLoadingFromDatabase(true);
        console.log('🔄 Initializing database connection...');

        // Initialize database service
        await databaseService.initialize();
        setIsDatabaseConnected(true);
        console.log('✅ Database connected successfully');

        // Get real user data from Clerk
        if (user) {
          console.log('👤 Real Clerk user data:', {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          });

          // Track sign-in to database
          try {
            await authService.trackSignIn(user);
            console.log('✅ Sign-in tracked successfully');
          } catch (error) {
            console.error('❌ Error tracking sign-in:', error);
          }

          // Sync user profile with database
          await syncUserProfileToDatabase(
            user.id,
            user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            user.firstName || '',
            user.lastName || ''
          );

          // Load food logs from database
          await loadFoodLogsFromDatabase(user.id);
        }

      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        setIsDatabaseConnected(false);
        // Fallback to localStorage only
        console.log('📱 Falling back to localStorage only');
      } finally {
        setIsLoadingFromDatabase(false);
      }
    };

    initializeDatabase();
  }, [isSignedIn, isLoaded]);

  // Database sync functions
  const syncUserProfileToDatabase = async (clerkId: string, email: string, firstName?: string, lastName?: string) => {
    try {
      console.log('🔄 Syncing user profile to database...');

      // Get profile data from localStorage
      const height = localStorage.getItem('userHeight');
      const weight = localStorage.getItem('userWeight');
      const workoutFrequency = localStorage.getItem('workoutFrequency');
      const goal = localStorage.getItem('goal');
      const gender = localStorage.getItem('gender');
      const birthdate = localStorage.getItem('birthdate');
      const nutritionPlan = localStorage.getItem('nutritionPlan');

      if (height && weight && workoutFrequency && goal && gender && birthdate && nutritionPlan) {
        const birthdateData = JSON.parse(birthdate);
        const nutritionData = JSON.parse(nutritionPlan);

        // Calculate age
        const birthDate = new Date(
          parseInt(birthdateData.year),
          parseInt(birthdateData.month) - 1,
          parseInt(birthdateData.day)
        );
        const age = new Date().getFullYear() - birthDate.getFullYear();

        const userData = {
          clerkId,
          email,
          firstName,
          lastName,
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

        const savedProfile = await databaseService.createOrUpdateUserProfile(userData);
        setUserProfile(savedProfile);
        console.log('✅ User profile synced to database');
      }
    } catch (error) {
      console.error('❌ Error syncing user profile:', error);
    }
  };

  const loadFoodLogsFromDatabase = async (userId: string) => {
    try {
      console.log('🔄 Loading food logs from database...');
      const logs = await databaseService.getFoodLogsForDate(userId, selectedDate);
      setDatabaseLogs(logs);

      // Convert to local format for compatibility
      const localLogs = logs.map(log => ({
        id: log._id.toString(),
        description: log.description,
        health_suggestion: log.healthSuggestion,
        calories: log.nutrition.calories,
        protein: log.nutrition.protein,
        carbs: log.nutrition.carbs,
        fats: log.nutrition.fats,
        date: format(log.logDate, 'yyyy-MM-dd'),
        timestamp: log.createdAt.toISOString(),
      }));

      setNutritionLogs(localLogs);
      console.log('✅ Food logs loaded from database:', logs.length);
    } catch (error) {
      console.error('❌ Error loading food logs from database:', error);
    }
  };

  const saveFoodLogToDatabase = async (foodLogData: any) => {
    if (!isDatabaseConnected || !userProfile) {
      console.log('📱 Database not connected, saving to localStorage only');
      return;
    }

    try {
      console.log('🔄 Saving food log to database...');

      const dbFoodLog = await databaseService.createFoodLog({
        userId: userProfile.clerkId,
        description: foodLogData.description,
        healthSuggestion: foodLogData.health_suggestion,
        nutrition: {
          calories: foodLogData.calories,
          protein: foodLogData.protein,
          carbs: foodLogData.carbs,
          fats: foodLogData.fats,
        },
        imageData: foodLogData.imageData ? {
          originalImage: foodLogData.imageData,
          imageSize: foodLogData.imageData.length,
          imageFormat: 'jpeg',
          analysisConfidence: foodLogData.confidence || 'medium',
        } : undefined,
        aiAnalysis: {
          isFood: foodLogData.is_food !== false,
          confidence: foodLogData.confidence || 'medium',
          detectedItems: [foodLogData.description],
          aiService: 'gemini',
        },
        logDate: new Date(),
      });

      console.log('✅ Food log saved to database:', dbFoodLog._id);

      // Refresh logs from database
      await loadFoodLogsFromDatabase(userProfile.clerkId);

    } catch (error) {
      console.error('❌ Error saving food log to database:', error);
    }
  };

  // Load nutrition logs from localStorage
  useEffect(() => {
    const logs = localStorage.getItem('nutritionLogs');
    if (logs) {
      setNutritionLogs(JSON.parse(logs));
    }
  }, []);



  // Get logs for selected date
  const getLogsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return nutritionLogs.filter(log => log.date === dateString);
  };

  const todayLogs = getLogsForDate(selectedDate);

  // Calculate totals for selected date
  const getTotalsForDate = (date: Date) => {
    const logs = getLogsForDate(date);
    return logs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fats: totals.fats + log.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  // Get goals from saved nutrition plan or use defaults
  const getGoals = () => {
    const nutritionPlan = localStorage.getItem('nutritionPlan');
    if (nutritionPlan) {
      const plan = JSON.parse(nutritionPlan);
      console.log('Using goals from saved nutrition plan:', plan);
      return {
        calories: plan.calories || 2200,
        protein: plan.protein || 200,
        carbs: plan.carbs || 286,
        fats: plan.fats || 81
      };
    }
    
    // Fallback defaults
    console.log('Using default goals');
    return {
      calories: 2200,
      protein: 200,
      carbs: 286,
      fats: 81
    };
  };

  const goals = getGoals();

  const currentTotals = getTotalsForDate(selectedDate);

  // Debug: Log current totals and goals to verify calculations
  console.log('Current totals:', currentTotals);
  console.log('Goals:', goals);

  // Get user profile data
  const getUserProfile = () => {
    // Try consolidated data first
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      try {
        return JSON.parse(onboardingData);
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
      }
    }

    // Fall back to individual keys
    const height = localStorage.getItem('userHeight') || "";
    const weight = localStorage.getItem('userWeight') || "";
    const workoutFrequency = localStorage.getItem('workoutFrequency') || "";
    const goal = localStorage.getItem('goal') || "";
    const gender = localStorage.getItem('gender') || "";

    let birthdate = { month: "", day: "", year: "" };
    const savedBirthdate = localStorage.getItem('birthdate');
    if (savedBirthdate) {
      try {
        birthdate = JSON.parse(savedBirthdate);
      } catch (error) {
        console.error('Error parsing birthdate:', error);
      }
    }

    return {
      height,
      weight,
      birthdate,
      workoutFrequency,
      goal,
      gender
    };
  };

  const localUserProfile = getUserProfile();

  // Calculate age from birthdate
  const calculateAge = () => {
    if (!userProfile?.profileData?.age) {
      // Fallback to localStorage if database profile not available
      const birthdate = localStorage.getItem('birthdate');
      if (!birthdate) return null;

      try {
        const birthdateData = JSON.parse(birthdate);
        if (!birthdateData.year || !birthdateData.month || !birthdateData.day) {
          return null;
        }

        const birthDate = new Date(
          parseInt(birthdateData.year),
          parseInt(birthdateData.month) - 1,
          parseInt(birthdateData.day)
        );
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear() -
          (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

        return age;
      } catch {
        return null;
      }
    }

    return userProfile.profileData.age;
  };

  const userAge = calculateAge();

  // Analyze food logs with AI when logs change
  useEffect(() => {
    const analyzeFoodLogs = async () => {
      console.log('🔍 Checking AI analysis prerequisites...');
      console.log('Nutrition logs:', nutritionLogs.length);
      console.log('User profile:', { height: userProfile?.profileData?.height, weight: userProfile?.profileData?.weight });

      // Check if we have the minimum required data
      if (!userProfile?.profileData?.height || !userProfile?.profileData?.weight) {
        console.log('❌ Missing user profile data (height/weight) - AI analysis skipped');
        setFoodAnalysis(null);
        return;
      }

      // Get nutrition plan
      const nutritionPlan = localStorage.getItem('nutritionPlan');
      if (!nutritionPlan) {
        console.log('❌ Missing nutrition plan - AI analysis skipped');
        setFoodAnalysis(null);
        return;
      }

      // Get today's logs
      const today = selectedDate.toISOString().split('T')[0];
      const todaysLogs = nutritionLogs.filter(log => log.date === today);
      console.log(`📅 Today's logs (${today}):`, todaysLogs.length);

      // If no logs for today, show a helpful message but still try to provide general guidance
      if (todaysLogs.length === 0) {
        console.log('📝 No food logs for today - providing general guidance');
        try {
          const nutritionResults = JSON.parse(nutritionPlan);
          setFoodAnalysis({
            overallAssessment: `No food logged yet for ${format(selectedDate, 'MMM d')}. Start tracking to get personalized insights!`,
            whatToEat: [
              `Aim for ${nutritionResults.protein}g protein today`,
              "Include plenty of vegetables and fruits",
              "Choose complex carbohydrates",
              "Add healthy fats like nuts or avocado"
            ],
            whatToAvoid: [
              "Processed and packaged foods",
              "Sugary drinks and snacks",
              "Excessive portion sizes"
            ],
            mealSuggestions: [
              `Breakfast: Protein-rich meal (~${Math.round(nutritionResults.calories * 0.25)} calories)`,
              `Lunch: Balanced meal with protein and vegetables (~${Math.round(nutritionResults.calories * 0.35)} calories)`,
              `Dinner: Light but satisfying meal (~${Math.round(nutritionResults.calories * 0.3)} calories)`
            ],
            nutritionGaps: [`Target: ${nutritionResults.calories} calories, ${nutritionResults.protein}g protein`],
            progressFeedback: "Start logging your meals to get AI-powered insights and recommendations!"
          });
        } catch (error) {
          console.error('Error parsing nutrition plan:', error);
          setFoodAnalysis(null);
        }
        return;
      }

      try {
        setIsAnalyzingFood(true);
        const nutritionResults = JSON.parse(nutritionPlan);
        console.log('🤖 Starting AI analysis...', { todaysLogs: todaysLogs.length, userProfile: !!userProfile, nutritionResults: !!nutritionResults });

        const analysis = await geminiService.analyzeFoodLogs(localUserProfile, nutritionResults, todaysLogs);
        setFoodAnalysis(analysis);
        console.log('✅ AI analysis completed:', analysis);
      } catch (error) {
        console.error('❌ Error analyzing food logs:', error);

        // Enhanced fallback analysis with actual data
        try {
          const nutritionResults = JSON.parse(nutritionPlan);
          const totalCalories = todaysLogs.reduce((sum, log) => sum + log.calories, 0);
          const totalProtein = todaysLogs.reduce((sum, log) => sum + log.protein, 0);
          const calorieProgress = Math.round((totalCalories / nutritionResults.calories) * 100);
          const proteinProgress = Math.round((totalProtein / nutritionResults.protein) * 100);

          setFoodAnalysis({
            overallAssessment: `You've logged ${totalCalories} calories (${calorieProgress}% of target) and ${totalProtein}g protein (${proteinProgress}% of target) today.`,
            whatToEat: [
              totalProtein < nutritionResults.protein * 0.7 ? "More protein-rich foods (chicken, fish, eggs, legumes)" : "Continue with balanced protein intake",
              totalCalories < nutritionResults.calories * 0.8 ? "More nutrient-dense calories" : "Focus on nutrient quality",
              "Plenty of vegetables for vitamins and fiber",
              "Complex carbohydrates for sustained energy"
            ],
            whatToAvoid: [
              "Empty calories from processed foods",
              "Sugary drinks and snacks",
              totalCalories > nutritionResults.calories * 1.1 ? "Large portion sizes" : "Skipping meals"
            ],
            mealSuggestions: [
              `Next meal: Include ${Math.max(20, Math.round((nutritionResults.protein - totalProtein) / 3))}g protein`,
              "Balanced plate: 1/2 vegetables, 1/4 protein, 1/4 complex carbs",
              "Healthy snack: Greek yogurt with berries or nuts"
            ],
            nutritionGaps: [
              `Calories: ${Math.max(0, nutritionResults.calories - totalCalories)} remaining`,
              `Protein: ${Math.max(0, nutritionResults.protein - totalProtein)}g remaining`
            ],
            progressFeedback: calorieProgress > 90 ? "Great job hitting your calorie target!" : "Keep logging to reach your daily nutrition goals!"
          });
        } catch (fallbackError) {
          console.error('❌ Fallback analysis also failed:', fallbackError);
          setFoodAnalysis({
            overallAssessment: "Unable to analyze your food logs right now, but keep tracking!",
            whatToEat: ["Lean proteins", "Vegetables and fruits", "Whole grains", "Healthy fats"],
            whatToAvoid: ["Processed foods", "Sugary drinks", "Large portions"],
            mealSuggestions: ["Balanced meals with protein and vegetables"],
            nutritionGaps: ["Continue logging for better insights"],
            progressFeedback: "Every meal logged is progress toward your goals!"
          });
        }
      } finally {
        setIsAnalyzingFood(false);
      }
    };

    // Debounce the analysis to avoid too many API calls
    const timeoutId = setTimeout(analyzeFoodLogs, 1000);
    return () => clearTimeout(timeoutId);
  }, [nutritionLogs, selectedDate, userProfile]);

  // Get AI analysis from localStorage
  const getAIAnalysis = () => {
    try {
      const savedAnalysis = localStorage.getItem('aiAnalysis');
      if (savedAnalysis) {
        return JSON.parse(savedAnalysis);
      }
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
    }
    return null;
  };

  const [aiAnalysis, setAiAnalysis] = useState(getAIAnalysis());
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);

  // Listen for localStorage changes to detect when Custom Plan saves AI analysis
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aiAnalysis' && e.newValue) {
        console.log('🔄 AI analysis updated from Custom Plan, refreshing dashboard...');
        try {
          const newAnalysis = JSON.parse(e.newValue);
          setAiAnalysis(newAnalysis);
        } catch (error) {
          console.error('Error parsing updated AI analysis:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load existing AI analysis and only generate new one if needed
  useEffect(() => {
    const loadOrGenerateAIAnalysis = async () => {
      // Always check for existing analysis first (refresh from localStorage)
      const existingAnalysis = getAIAnalysis();
      const lastAnalysisDate = localStorage.getItem('aiAnalysisDate');
      const today = new Date().toDateString();

      console.log('🔍 Checking for AI analysis...', {
        hasAnalysis: !!existingAnalysis,
        analysisDate: lastAnalysisDate,
        today: today,
        analysisPreview: existingAnalysis ? existingAnalysis.healthAssessment?.substring(0, 50) + '...' : 'None'
      });

      // If we have analysis from today (including from Custom Plan), use it
      if (existingAnalysis && lastAnalysisDate === today) {
        console.log('✅ Using existing AI analysis from today (possibly from Custom Plan)');
        setAiAnalysis(existingAnalysis);
        return;
      }

      // If we have any existing analysis (even from previous days), use it
      if (existingAnalysis) {
        console.log('✅ Using existing AI analysis from previous session');
        setAiAnalysis(existingAnalysis);
        return;
      }

      // Only generate new analysis if we have no existing analysis at all
      console.log('🔍 No existing AI analysis found, checking if we can generate new one...');

      // Check if we have the required profile data
      if (!localUserProfile.height || !localUserProfile.weight || !localUserProfile.goal) {
        console.log('❌ Missing user profile data - AI analysis skipped');
        return;
      }

      // Get nutrition plan
      const nutritionPlan = localStorage.getItem('nutritionPlan');
      if (!nutritionPlan) {
        console.log('❌ Missing nutrition plan - AI analysis skipped');
        return;
      }

      try {
        setIsAnalyzingProfile(true);
        console.log('🤖 Starting new AI profile analysis...');

        const nutritionResults = JSON.parse(nutritionPlan);
        const analysis = await geminiService.analyzeUserProfile(localUserProfile, nutritionResults);

        // Save analysis to localStorage with today's date
        localStorage.setItem('aiAnalysis', JSON.stringify(analysis));
        localStorage.setItem('aiAnalysisDate', today);

        setAiAnalysis(analysis);
        console.log('✅ New AI profile analysis completed:', analysis);

      } catch (error) {
        console.error('❌ Error analyzing user profile:', error);

        // Create fallback analysis only if no existing analysis
        const fallbackAnalysis = {
          healthAssessment: "Welcome to your personalized nutrition journey! Your profile has been set up successfully.",
          personalizedTips: [
            "Stay consistent with your daily calorie target",
            "Focus on getting adequate protein throughout the day",
            "Include plenty of vegetables in your meals",
            "Stay hydrated by drinking water regularly"
          ],
          warnings: [],
          motivationalMessage: "You're taking a great step towards better health! Every small action counts towards your goals.",
          nutritionRecommendations: "Follow your calculated macro targets and focus on whole, nutrient-dense foods.",
          exerciseRecommendations: `Your ${localUserProfile.workoutFrequency} workout schedule is excellent for your goals.`,
          lifestyleAdvice: "Consistency is key. Small, sustainable changes lead to lasting results."
        };

        localStorage.setItem('aiAnalysis', JSON.stringify(fallbackAnalysis));
        localStorage.setItem('aiAnalysisDate', today);
        setAiAnalysis(fallbackAnalysis);

      } finally {
        setIsAnalyzingProfile(false);
      }
    };

    // Load analysis immediately, no debounce needed
    loadOrGenerateAIAnalysis();
  }, []); // Empty dependency array - only run once on mount

  // Format goal text
  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'Lose Weight';
      case 'maintain':
        return 'Maintain Weight';
      case 'gain':
        return 'Gain Weight';
      default:
        return 'Not Set';
    }
  };

  // Format workout frequency text
  const getWorkoutFrequencyText = (frequency: string) => {
    switch (frequency) {
      case '0-2':
        return '0-2 days/week';
      case '3-5':
        return '3-5 days/week';
      case '6+':
        return '6+ days/week';
      default:
        return 'Not Set';
    }
  };

  // Get week days
  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Check if today is a specific day
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get the day abbreviation (M, T, W, T, F, S, S)
  const getDayLetter = (date: Date) => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayNames[date.getDay()];
  };

  // Get calorie status with better analysis
  const getCalorieStatus = () => {
    const remaining = goals.calories - currentTotals.calories;
    const percentage = getProgressPercentage(currentTotals.calories, goals.calories);

    if (percentage === 0) {
      return "Start logging your meals";
    } else if (remaining > 0) {
      if (percentage < 50) {
        return `${remaining} calories left - Keep going!`;
      } else if (percentage < 80) {
        return `${remaining} calories left - Good progress`;
      } else {
        return `${remaining} calories left - Almost there!`;
      }
    } else {
      const over = Math.abs(remaining);
      if (percentage <= 110) {
        return `${over} calories over - Still okay`;
      } else {
        return `${over} calories over - Consider lighter meals`;
      }
    }
  };

  // Get macro remaining
  const getMacroRemaining = (macro: keyof typeof goals) => {
    if (macro === 'calories') return 0;
    return Math.max(0, goals[macro] - currentTotals[macro]);
  };

  // Get progress percentage (can exceed 100% to show over-consumption)
  const getProgressPercentage = (consumed: number, goal: number) => {
    if (goal === 0) return 0;
    const percentage = (consumed / goal) * 100;
    console.log(`Progress: ${consumed}/${goal} = ${percentage.toFixed(1)}%`);
    return percentage;
  };

  // Calculate strokeDashoffset for doughnut ring filling
  const getRingFill = (consumed: number, goal: number, radius: number) => {
    if (goal === 0 || consumed === 0) {
      // Empty ring - show full circumference as offset (no fill)
      return 2 * Math.PI * radius;
    }

    const percentage = Math.min((consumed / goal), 1); // Cap at 100% (1.0)
    const circumference = 2 * Math.PI * radius;

    // strokeDashoffset calculation:
    // - Full circumference = empty ring (100% offset)
    // - 0 = completely filled ring (0% offset)
    // - We want to reduce offset as percentage increases
    const strokeDashoffset = circumference * (1 - percentage);

    console.log(`🍩 Ring: ${consumed}/${goal} = ${(percentage * 100).toFixed(1)}% | Circumference: ${circumference.toFixed(1)} | Offset: ${strokeDashoffset.toFixed(1)}`);
    return strokeDashoffset;
  };

  // Enhanced mobile camera initialization with comprehensive mobile support
  const handleCameraClick = async () => {
    try {
      console.log('📱 Requesting camera access...');

      // Comprehensive mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      console.log('📱 Device info:', { isMobile, isIOS, isAndroid });

      // Check for HTTPS requirement on mobile
      if (isMobile && location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('HTTPS_REQUIRED: Camera requires HTTPS on mobile devices');
      }

      // Check camera API support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('CAMERA_NOT_SUPPORTED: Camera API not supported on this device');
      }

      // Mobile-optimized camera constraints
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera for better food photos
          width: {
            ideal: isMobile ? 1920 : 1280,
            min: 640,
            max: isMobile ? 4096 : 1920
          },
          height: {
            ideal: isMobile ? 1080 : 720,
            min: 480,
            max: isMobile ? 2160 : 1080
          },
          aspectRatio: { ideal: 16/9 },
          // Mobile-specific optimizations
          ...(isMobile && {
            frameRate: { ideal: 30, min: 15 },
            focusMode: 'continuous',
            exposureMode: 'continuous',
            whiteBalanceMode: 'continuous'
          })
        },
        audio: false // We don't need audio for food photos
      };

      console.log('📹 Camera constraints:', constraints);

      // Request camera with mobile-optimized settings
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Camera access granted');
      console.log('📹 Stream settings:', {
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });

      setVideoStream(stream);
      setShowCamera(true);
    } catch (error: any) {
      console.error("❌ Error accessing camera:", error);

      // Mobile-specific error handling
      let errorMessage = '❌ Camera access failed. ';
      let showFallback = false;

      if (error.message?.includes('HTTPS_REQUIRED')) {
        errorMessage = '🔒 HTTPS Required: Camera needs a secure connection on mobile devices. Please use HTTPS.';
      } else if (error.message?.includes('CAMERA_NOT_SUPPORTED')) {
        errorMessage = '📱 Camera not supported on this device or browser.';
        showFallback = true;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = '🔐 Camera permission denied. Please:\n\n1. Tap the camera icon in your browser\n2. Select "Allow" for camera access\n3. Try again';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '📹 No camera found on this device.';
        showFallback = true;
      } else if (error.name === 'NotReadableError') {
        errorMessage = '📱 Camera is being used by another app. Please close other camera apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '⚙️ Camera settings not supported. Trying with basic settings...';
        // Try with fallback constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          setVideoStream(fallbackStream);
          setShowCamera(true);
          return;
        } catch (fallbackError) {
          errorMessage += ' Fallback also failed.';
        }
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }

      alert(errorMessage);

      // Show fallback UI for file upload if camera completely fails
      if (showFallback) {
        // Could implement file upload fallback here
        console.log('📁 Camera failed, could show file upload option');
      }

      // Still show camera UI for testing (fallback mode)
      setShowCamera(true);
    }
  };

  // Enhanced image capture with better quality and validation
  const captureImageFromVideo = (video: HTMLVideoElement): string => {
    try {
      console.log('📸 Starting image capture...');
      console.log('📹 Video state:', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime
      });

      // Wait for video to be ready
      if (video.readyState < 2) {
        console.warn('⚠️ Video not ready for capture, readyState:', video.readyState);
        return '';
      }

      // Ensure we have valid video dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('⚠️ Invalid video dimensions:', video.videoWidth, 'x', video.videoHeight);
        return '';
      }

      const canvas = document.createElement('canvas');

      // Use actual video dimensions for best quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log('📐 Canvas dimensions set to:', canvas.width, 'x', canvas.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
        return '';
      }

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to high-quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      console.log('✅ Image captured successfully');
      console.log('📊 Image stats:', {
        dataUrlLength: dataUrl.length,
        estimatedSizeKB: Math.round(dataUrl.length * 0.75 / 1024),
        dimensions: `${canvas.width}x${canvas.height}`
      });

      // Validate the captured image
      if (dataUrl.length < 5000) {
        console.warn('⚠️ Captured image seems too small:', dataUrl.length, 'bytes');
        return '';
      }

      return dataUrl;
    } catch (error) {
      console.error('❌ Error capturing image from video:', error);
      return '';
    }
  };

  // Enhanced photo handling with comprehensive error checking
  const handleTakePhoto = async () => {
    console.log('🚀 Starting photo capture and analysis...');

    if (!videoStream) {
      alert('❌ Camera not available. Please try again.');
      return;
    }

    setIsUploading(true);

    try {
      // Find the video element
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      if (!videoElement) {
        throw new Error('Video element not found in DOM');
      }

      console.log('� Video element found, checking state...');

      // Wait a moment for video to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the image
      console.log('�📸 Capturing image from video...');
      const imageDataUrl = captureImageFromVideo(videoElement);

      if (!imageDataUrl) {
        throw new Error('Failed to capture image from video - empty result');
      }

      if (!imageDataUrl.startsWith('data:image/')) {
        throw new Error('Invalid image data format');
      }

      // Extract base64 data for Gemini API
      const base64Image = imageDataUrl.split(',')[1];

      if (!base64Image || base64Image.length < 1000) {
        throw new Error('Invalid or too small base64 image data');
      }

      console.log('✅ Image captured successfully');
      console.log('� Base64 data length:', base64Image.length);
      console.log('📊 Estimated image size:', Math.round(base64Image.length * 0.75 / 1024), 'KB');

      // Create FormData for fallback API
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      console.log('🤖 Starting Gemini AI analysis...');

      try {
        console.log('🔍 Starting Gemini AI food analysis...');
        console.log('📸 Image data length:', base64Image.length);

        // Use Gemini API for food analysis
        const result = await geminiService.analyzeFoodImage(base64Image);
        console.log('✅ Gemini AI Analysis result:', result);

        // Enhanced debugging
        if (!result) {
          throw new Error('No result returned from Gemini AI');
        }

        // Check if it's actually food
        if (result.is_food === false) {
          console.log('⚠️ Non-food item detected:', result.description);
          alert(`❌ Not Food Detected!\n\n${result.description}\n\n💡 ${result.health_suggestion}\n\nPlease take a photo of actual food for nutrition tracking.`);
          return; // Don't create a log entry for non-food items
        }

        // Enhanced validation for food items
        if (result.is_food === true) {
          console.log('✅ Food item detected:', result.description);
          console.log('📊 Nutrition data:', {
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fats: result.fats,
            confidence: result.confidence
          });

          // Validate that we have reasonable nutrition values
          if (result.calories === 0 && result.protein === 0 && result.carbs === 0 && result.fats === 0) {
            console.log('⚠️ No nutrition data detected');
            if (!confirm(`⚠️ No nutrition data found in this image.\n\n${result.description}\n\nWould you like to add it anyway as a 0-calorie entry?`)) {
              return;
            }
          }
        } else {
          console.warn('⚠️ Unexpected is_food value:', result.is_food);
        }

        // Create nutrition log entry only for food items
        const nutritionLog: NutritionLog = {
          id: Date.now().toString(),
          description: result.description || 'Food Item',
          health_suggestion: result.health_suggestion || 'Enjoy in moderation',
          calories: Number(result.calories) || 0,
          carbs: Number(result.carbs) || 0,
          protein: Number(result.protein) || 0,
          fats: Number(result.fats) || 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          timestamp: new Date().toISOString(),
        };

        // Save to localStorage
        const existingLogs = JSON.parse(localStorage.getItem('nutritionLogs') || '[]');
        const updatedLogs = [...existingLogs, nutritionLog];
        localStorage.setItem('nutritionLogs', JSON.stringify(updatedLogs));
        setNutritionLogs(updatedLogs);

        console.log('✅ Food analyzed and added to logs:', nutritionLog);

        // Show success message with confidence indicator
        const confidenceText = result.confidence === 'low' ? '\n⚠️ Low confidence - please verify the nutrition data' : '';
        alert(`🎉 Food Added Successfully!\n\n${result.description}\n\n📊 Nutrition:\n• ${result.calories} calories\n• ${result.protein}g protein\n• ${result.carbs}g carbs\n• ${result.fats}g fats${confidenceText}\n\n✅ Food has been added to your Recent Logs!\nScroll down to see it and check your updated charts!`);

      } catch (geminiError) {
        console.error('❌ Gemini AI analysis failed:', geminiError);

        // Fallback to external API if Gemini fails
        console.log('🔄 Trying external API as fallback...');

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const apiResponse = await fetch('https://proxa.app.nBn.cloud/webhook/4b4accd3-c955-4d81-8236-892346c42408', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);

          if (apiResponse.ok) {
            const result = await apiResponse.json();
            console.log('✅ External API Analysis result:', result);

            // Create nutrition log entry
            const nutritionLog: NutritionLog = {
              id: Date.now().toString(),
              description: result.description || 'Food Item',
              health_suggestion: result.health_suggestion || 'Enjoy in moderation',
              calories: Number(result.calories) || 0,
              carbs: Number(result.carbs) || 0,
              protein: Number(result.protein) || 0,
              fats: Number(result.fats) || 0,
              date: format(new Date(), 'yyyy-MM-dd'),
              timestamp: new Date().toISOString(),
            };

            // Save to localStorage
            const existingLogs = JSON.parse(localStorage.getItem('nutritionLogs') || '[]');
            const updatedLogs = [...existingLogs, nutritionLog];
            localStorage.setItem('nutritionLogs', JSON.stringify(updatedLogs));
            setNutritionLogs(updatedLogs);

            alert(`🎉 Food Added Successfully!\n\n${result.description}\n\n📊 Nutrition:\n• ${result.calories} calories\n• ${result.protein}g protein\n• ${result.carbs}g carbs\n• ${result.fats}g fats\n\nCheck your updated charts and recent logs below!`);

          } else {
            throw new Error(`External API failed: ${apiResponse.status}`);
          }
        } catch (externalApiError) {
          console.error('❌ External API also failed:', externalApiError);

          // Final fallback - manual entry
          if (confirm('❌ Both AI services are unavailable. Would you like to add a manual food entry instead?')) {
            const manualEntry = await createManualFoodEntry();
            if (manualEntry) {
              const existingLogs = JSON.parse(localStorage.getItem('nutritionLogs') || '[]');
              const updatedLogs = [...existingLogs, manualEntry];
              localStorage.setItem('nutritionLogs', JSON.stringify(updatedLogs));
              setNutritionLogs(updatedLogs);
              alert('✅ Manual food entry added successfully!');
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Error in handleTakePhoto:', error);

      let errorMessage = '❌ Error processing image. ';
      if (error.message.includes('timeout') || error.message.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('capture')) {
        errorMessage += 'Failed to capture image. Please try taking the photo again.';
      } else {
        errorMessage += 'Please try again or use the manual entry option.';
      }

      alert(errorMessage);

      // Offer manual entry as fallback
      if (confirm('Would you like to add a manual food entry instead?')) {
        try {
          const manualEntry = await createManualFoodEntry();
          if (manualEntry) {
            const existingLogs = JSON.parse(localStorage.getItem('nutritionLogs') || '[]');
            const updatedLogs = [...existingLogs, manualEntry];
            localStorage.setItem('nutritionLogs', JSON.stringify(updatedLogs));
            setNutritionLogs(updatedLogs);
            alert('✅ Manual food entry added successfully!');
          }
        } catch (manualError) {
          console.error('Error creating manual entry:', manualError);
        }
      }
    } finally {
      setIsUploading(false);
      handleCloseCamera();
    }
  };

  // Helper function to create manual food entry
  const createManualFoodEntry = async (): Promise<NutritionLog | null> => {
    const description = prompt('Enter food description:');
    if (!description) return null;

    const calories = prompt('Enter calories (approximate):');
    const protein = prompt('Enter protein in grams (approximate):');
    const carbs = prompt('Enter carbs in grams (approximate):');
    const fats = prompt('Enter fats in grams (approximate):');

    return {
      id: Date.now().toString(),
      description: description,
      health_suggestion: 'Manual entry - enjoy in moderation',
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fats: Number(fats) || 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      timestamp: new Date().toISOString(),
    };
  };

  // Handle close camera
  const handleCloseCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
  };



  // Generate meal plan
  const generateMealPlan = async () => {
    console.log('🍽️ Generating AI meal plan...');
    setIsGeneratingMealPlan(true);

    try {
      const nutritionPlan = localStorage.getItem('nutritionPlan');
      if (!nutritionPlan || !localUserProfile.height || !localUserProfile.weight) {
        throw new Error('Missing required data for meal plan');
      }

      const nutritionResults = JSON.parse(nutritionPlan);

      // Use AI to generate meal plan
      const mealPlanData = await geminiService.generateMealPlan(localUserProfile, nutritionResults);
      setMealPlan(mealPlanData);
      console.log('✅ AI meal plan generated successfully');
    } catch (error) {
      console.error('❌ AI meal plan generation failed:', error);

      // Fallback meal plan
      const nutritionPlan = localStorage.getItem('nutritionPlan');
      if (nutritionPlan) {
        try {
          const nutritionResults = JSON.parse(nutritionPlan);
          const fallbackMealPlan = {
            breakfast: {
              name: "Protein-Rich Breakfast",
              calories: Math.round(nutritionResults.calories * 0.25),
              protein: Math.round(nutritionResults.protein * 0.3),
              carbs: Math.round(nutritionResults.carbs * 0.25),
              fats: Math.round(nutritionResults.fats * 0.25),
              description: "2 eggs, 1 slice whole grain toast, 1/2 avocado, and berries"
            },
            lunch: {
              name: "Balanced Power Bowl",
              calories: Math.round(nutritionResults.calories * 0.35),
              protein: Math.round(nutritionResults.protein * 0.4),
              carbs: Math.round(nutritionResults.carbs * 0.35),
              fats: Math.round(nutritionResults.fats * 0.35),
              description: "Grilled chicken, quinoa, mixed vegetables, and olive oil"
            },
            dinner: {
              name: "Light & Nutritious Dinner",
              calories: Math.round(nutritionResults.calories * 0.3),
              protein: Math.round(nutritionResults.protein * 0.25),
              carbs: Math.round(nutritionResults.carbs * 0.3),
              fats: Math.round(nutritionResults.fats * 0.3),
              description: "Salmon, steamed broccoli, and sweet potato"
            },
            snacks: [{
              name: "Protein Snack",
              calories: Math.round(nutritionResults.calories * 0.1),
              protein: Math.round(nutritionResults.protein * 0.05),
              carbs: Math.round(nutritionResults.carbs * 0.1),
              fats: Math.round(nutritionResults.fats * 0.1),
              description: "Greek yogurt with almonds"
            }],
            tips: [
              "Drink water before each meal",
              "Eat slowly and mindfully",
              "Include colorful vegetables",
              "Stay consistent with meal timing"
            ]
          };

          setMealPlan(fallbackMealPlan);
          console.log('✅ Fallback meal plan created');
        } catch (parseError) {
          console.error('❌ Failed to create fallback meal plan:', parseError);
        }
      }
    } finally {
      setIsGeneratingMealPlan(false);
    }
  };



  const weekDays = getWeekDays();

  if (showCamera) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        {videoStream ? (
          <>
            <video
              ref={(video) => {
                if (video && videoStream) {
                  video.srcObject = videoStream;
                  // Enhanced mobile video handling
                  video.setAttribute('webkit-playsinline', 'true');
                  video.setAttribute('playsinline', 'true');
                  video.play().catch((error) => {
                    console.error('Video play error:', error);
                    // Try to play again after a short delay (mobile Safari fix)
                    setTimeout(() => {
                      video.play().catch(console.error);
                    }, 100);
                  });
                }
              }}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              // Mobile-specific attributes
              webkit-playsinline="true"
              controls={false}
              disablePictureInPicture
              style={{
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror for better UX (like selfie camera)
                WebkitTransform: 'scaleX(-1)'
              }}
            />

            {/* Mobile-optimized overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Camera Active</span>
              </div>
              <div className="text-xs space-y-1 text-gray-200">
                <div>🎯 Point at your food</div>
                <div>💡 Ensure good lighting</div>
                <div>📱 Tap "Take Photo" when ready</div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera size={64} className="mx-auto mb-4" />
              <p className="mb-4">Initializing camera...</p>
              <p className="text-sm text-gray-400">Please allow camera permissions</p>
            </div>
          </div>
        )}
        {/* AI Processing Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-purple-600" />
              <div className="text-lg font-semibold text-gray-800 mb-2">AI Analyzing Food...</div>
              <div className="text-sm text-gray-600">Getting nutrition information</div>
            </div>
          </div>
        )}

        {/* Mobile-optimized camera controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            onClick={handleCloseCamera}
            variant="outline"
            className="bg-white text-black border-2 border-gray-300 hover:bg-gray-100 px-6 py-3 text-lg font-medium rounded-xl shadow-lg"
            disabled={isUploading}
            style={{ minHeight: '48px', minWidth: '100px' }} // Touch-friendly size
          >
            Cancel
          </Button>
          <Button
            onClick={handleTakePhoto}
            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transform active:scale-95 transition-all duration-150"
            disabled={isUploading}
            style={{ minHeight: '48px', minWidth: '140px' }} // Touch-friendly size
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 animate-pulse" />
                <span>AI Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <span>Take Photo</span>
              </div>
            )}
          </Button>
        </div>

        {/* Mobile camera instructions overlay */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm text-center max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Camera Ready</span>
          </div>
          <div className="text-xs text-gray-200">
            Position food in frame and tap "Take Photo"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.1), inset 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-transparent">
        <div className="text-xl font-bold text-black">Cal AI</div>

        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-10 h-10 p-0">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Streak Counter */}
          <div className="flex items-center gap-1 text-orange-500">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-black">{streak}</span>
          </div>

          {/* User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>

      {/* Week Calendar Section - Second Position */}
      <div className="px-4 pb-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            {weekDays.map((day, index) => {
              const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center w-10 h-14 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <span className="text-xs font-medium mb-0.5">{getDayLetter(day)}</span>
                  <span className="text-sm font-semibold">{day.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">


        {/* User Profile Section */}
        {(userProfile?.profileData?.height && userProfile?.profileData?.weight) && (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                <User size={20} />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Height:</span>
                    <span className="font-medium text-black">{userProfile.profileData?.height} cm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium text-black">{userProfile.profileData?.weight} kg</span>
                  </div>
                  {userAge && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium text-black">{userAge} years</span>
                    </div>
                  )}
                </div>

                {/* Goals & Activity */}
                <div className="space-y-3">
                  {userProfile.profileData?.goal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target size={14} className="text-gray-600" />
                      <span className="font-medium text-black">{getGoalText(userProfile.profileData.goal)}</span>
                    </div>
                  )}
                  {userProfile.profileData?.workoutFrequency && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity size={14} className="text-gray-600" />
                      <span className="font-medium text-black">{getWorkoutFrequencyText(userProfile.profileData.workoutFrequency)}</span>
                    </div>
                  )}
                  {userProfile.profileData?.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium text-black capitalize">{userProfile.profileData.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Targets Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Daily Targets:</div>
                <div className="flex justify-between text-sm">
                  <span className="text-black font-medium">{goals.calories} cal</span>
                  <span className="text-red-500 font-medium">{goals.protein}g protein</span>
                  <span className="text-amber-500 font-medium">{goals.carbs}g carbs</span>
                  <span className="text-blue-500 font-medium">{goals.fats}g fats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Summary */}
        <div className="space-y-4">
          {/* Calorie Doughnut Chart */}
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Calories</h3>
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle (doughnut) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress circle - fills according to percentage */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="#ff6b35"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={getRingFill(currentTotals.calories, goals.calories, 35)}
                      className="transition-all duration-500 ease-in-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center logo and content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {getProgressPercentage(currentTotals.calories, goals.calories).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {currentTotals.calories}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">of {goals.calories} calories</div>
                  <div className="text-xs text-gray-500 mb-1">{getCalorieStatus()}</div>
                  {/* Debug info */}
                  <div className="text-xs text-blue-500">
                    Fill: {((currentTotals.calories / goals.calories) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Macro Doughnut Charts */}
          <div className="grid grid-cols-3 gap-4">
            {(['protein', 'carbs', 'fats'] as const).map((macro) => {
              const remaining = getMacroRemaining(macro);
              const consumed = currentTotals[macro];
              const goal = goals[macro];


              const getIconAndColor = (macro: string) => {
                switch (macro) {
                  case 'protein':
                    return {
                      strokeColor: '#e11d48', // Rose-600
                      bgColor: 'bg-rose-100',
                      emoji: '🥩',
                      title: 'Protein'
                    };
                  case 'carbs':
                    return {
                      strokeColor: '#7c3aed', // Violet-600
                      bgColor: 'bg-violet-100',
                      emoji: '🌾',
                      title: 'Carbs'
                    };
                  case 'fats':
                    return {
                      strokeColor: '#059669', // Emerald-600
                      bgColor: 'bg-emerald-100',
                      emoji: '🥑',
                      title: 'Fats'
                    };
                  default:
                    return {
                      strokeColor: '#9ca3af',
                      bgColor: 'bg-gray-100',
                      emoji: '❓',
                      title: 'Unknown'
                    };
                }
              };

              const { strokeColor, bgColor, emoji, title } = getIconAndColor(macro);

              return (
                <Card key={macro} className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
                      <div className="relative w-20 h-20 mb-3">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background circle (doughnut) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="#f1f5f9"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Progress circle - fills according to percentage */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke={strokeColor}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={getRingFill(consumed, goal, 35)}
                            className="transition-all duration-500 ease-in-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Center logo and percentage */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center mb-1`}>
                            <span className="text-lg">{emoji}</span>
                          </div>
                          <div className="text-xs font-medium text-gray-600">

                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{remaining}g</div>
                        <div className="text-xs text-gray-500 mb-1">of {goal}g left</div>
                        {/* Debug info */}
                        <div className="text-xs text-blue-500">
                          {consumed}g ({((consumed / goal) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Nutrition Assistant */}
        <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
              <Brain size={20} className="text-purple-500" />
              AI Nutrition Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4">
              <Button
                onClick={generateMealPlan}
                disabled={isGeneratingMealPlan}
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {isGeneratingMealPlan ? (
                  <>
                    <ChefHat className="h-4 w-4 mr-2 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan Section - Appears right after AI Nutrition Assistant */}
        {mealPlan && (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                <ChefHat size={20} className="text-orange-500" />
                Today's Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">

              {/* Breakfast */}
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-orange-800">🌅 Breakfast</div>
                  <div className="text-xs text-gray-600">{mealPlan.breakfast.calories} cal</div>
                </div>
                <div className="text-sm text-gray-700 mb-1">{mealPlan.breakfast.name}</div>
                <div className="text-xs text-gray-600">{mealPlan.breakfast.description}</div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>P: {mealPlan.breakfast.protein}g</span>
                  <span>C: {mealPlan.breakfast.carbs}g</span>
                  <span>F: {mealPlan.breakfast.fats}g</span>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-orange-800">☀️ Lunch</div>
                  <div className="text-xs text-gray-600">{mealPlan.lunch.calories} cal</div>
                </div>
                <div className="text-sm text-gray-700 mb-1">{mealPlan.lunch.name}</div>
                <div className="text-xs text-gray-600">{mealPlan.lunch.description}</div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>P: {mealPlan.lunch.protein}g</span>
                  <span>C: {mealPlan.lunch.carbs}g</span>
                  <span>F: {mealPlan.lunch.fats}g</span>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-orange-800">🌙 Dinner</div>
                  <div className="text-xs text-gray-600">{mealPlan.dinner.calories} cal</div>
                </div>
                <div className="text-sm text-gray-700 mb-1">{mealPlan.dinner.name}</div>
                <div className="text-xs text-gray-600">{mealPlan.dinner.description}</div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>P: {mealPlan.dinner.protein}g</span>
                  <span>C: {mealPlan.dinner.carbs}g</span>
                  <span>F: {mealPlan.dinner.fats}g</span>
                </div>
              </div>

              {/* Snacks */}
              {mealPlan.snacks && mealPlan.snacks.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-orange-100">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-orange-800">🍎 Snacks</div>
                    <div className="text-xs text-gray-600">{mealPlan.snacks[0].calories} cal</div>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">{mealPlan.snacks[0].name}</div>
                  <div className="text-xs text-gray-600">{mealPlan.snacks[0].description}</div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>P: {mealPlan.snacks[0].protein}g</span>
                    <span>C: {mealPlan.snacks[0].carbs}g</span>
                    <span>F: {mealPlan.snacks[0].fats}g</span>
                  </div>
                </div>
              )}

              {/* Tips */}
              {mealPlan.tips && mealPlan.tips.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800 mb-2">💡 Meal Plan Tips</div>
                  <ul className="space-y-1">
                    {mealPlan.tips.slice(0, 3).map((tip: string, index: number) => (
                      <li key={index} className="text-xs text-yellow-700 flex items-start gap-2">
                        <span className="text-yellow-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* AI Insights Section */}
        {isAnalyzingProfile ? (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <Brain className="h-6 w-6 animate-pulse text-blue-500" />
                <div className="text-lg font-medium text-gray-700">
                  AI is analyzing your profile...
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                Getting personalized health insights based on your goals
              </div>
            </CardContent>
          </Card>
        ) : aiAnalysis && (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                <Brain size={20} className="text-blue-500" />
                AI Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">

              {/* Health Assessment */}
              {aiAnalysis.healthAssessment && (
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Health Assessment</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{aiAnalysis.healthAssessment}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
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
              {aiAnalysis.personalizedTips && aiAnalysis.personalizedTips.length > 0 && (
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
              )}

              {/* Motivational Message */}
              {aiAnalysis.motivationalMessage && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-center">
                    <h4 className="font-semibold text-purple-800 mb-2">💪 Your Motivation</h4>
                    <p className="text-purple-700 text-sm italic leading-relaxed">"{aiAnalysis.motivationalMessage}"</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* Detailed AI Recommendations from Custom Plan */}
        {aiAnalysis && (aiAnalysis.nutritionRecommendations || aiAnalysis.exerciseRecommendations || aiAnalysis.lifestyleAdvice) && (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                <Target size={20} className="text-green-500" />
                Detailed Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">

              {/* Nutrition Recommendations */}
              {aiAnalysis.nutritionRecommendations && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🥗 Nutrition Advice
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.nutritionRecommendations}</p>
                </div>
              )}

              {/* Exercise Recommendations */}
              {aiAnalysis.exerciseRecommendations && (
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🏋️ Exercise Guidance
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.exerciseRecommendations}</p>
                </div>
              )}

              {/* Lifestyle Advice */}
              {aiAnalysis.lifestyleAdvice && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🌟 Lifestyle Tips
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{aiAnalysis.lifestyleAdvice}</p>
                </div>
              )}

            </CardContent>
          </Card>
        )}



        {/* Food Analysis Section */}
        {isAnalyzingFood ? (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <Brain className="h-6 w-6 animate-pulse text-purple-500" />
                <div className="text-lg font-medium text-gray-700">
                  AI is analyzing your food intake...
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                Getting personalized nutrition insights
              </div>
            </CardContent>
          </Card>
        ) : foodAnalysis ? (
          <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                <ChefHat size={20} className="text-green-500" />
                Smart Food Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">

              {/* Overall Assessment */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="text-sm font-medium text-gray-800 mb-1">📊 Today's Progress</div>
                <div className="text-sm text-gray-700">{foodAnalysis.overallAssessment}</div>
              </div>

              {/* What to Eat */}
              {foodAnalysis.whatToEat && foodAnalysis.whatToEat.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-sm font-medium text-green-800 mb-2">✅ What to Eat More</div>
                  <ul className="space-y-1">
                    {foodAnalysis.whatToEat.slice(0, 3).map((food: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to Avoid */}
              {foodAnalysis.whatToAvoid && foodAnalysis.whatToAvoid.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <div className="text-sm font-medium text-red-800 mb-2">⚠️ What to Limit</div>
                  <ul className="space-y-1">
                    {foodAnalysis.whatToAvoid.slice(0, 2).map((food: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meal Suggestions */}
              {foodAnalysis.mealSuggestions && foodAnalysis.mealSuggestions.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-sm font-medium text-blue-800 mb-2">🍽️ Meal Ideas</div>
                  <ul className="space-y-1">
                    {foodAnalysis.mealSuggestions.slice(0, 2).map((meal: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{meal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Feedback */}
              {foodAnalysis.progressFeedback && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-3 border border-purple-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-800 mb-1">🎯 Progress Update</div>
                    <div className="text-sm text-purple-700 italic">"{foodAnalysis.progressFeedback}"</div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ) : null}





        {/* Recently Logged */}
        <Card className="border-2 border-black bg-white hover:shadow-xl transition-all duration-300" style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
              📝 Recently Logged Food
              {todayLogs.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({todayLogs.length} items today)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {todayLogs.length > 0 ? (
                todayLogs.slice(0, 5).map((log, index) => (
                  <div key={log.id} className={`p-4 rounded-lg border transition-all duration-300 ${
                    index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-black">{log.description}</div>
                          {index === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {log.health_suggestion && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {log.health_suggestion}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-1 ml-4">
                        <div className="text-lg font-bold text-black">{log.calories}</div>
                        <div className="text-xs text-gray-500">calories</div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="text-red-600">{log.protein}g P</div>
                          <div className="text-amber-600">{log.carbs}g C</div>
                          <div className="text-blue-600">{log.fats}g F</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📸</div>
                  <div className="text-gray-500 mb-2 font-medium">No food logged for {format(selectedDate, 'MMM d')}</div>
                  <div className="text-sm text-gray-400 mb-4">Take a photo with the camera button to start tracking!</div>
                  <div className="text-xs text-gray-400">
                    Your analyzed food will appear here with detailed nutrition information
                  </div>
                </div>
              )}
            </div>

            {todayLogs.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <div className="text-sm text-gray-500">
                  Showing 5 of {todayLogs.length} items logged today
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Camera Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleCameraClick}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Camera className="h-8 w-8 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
