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

interface NutritionResults {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weightLossGoal?: number;
  targetDate?: string;
  debugInfo: any;
}

interface NutritionLog {
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

interface AIAnalysis {
  healthAssessment: string;
  personalizedTips: string[];
  warnings: string[];
  motivationalMessage: string;
  nutritionRecommendations: string;
  exerciseRecommendations: string;
  lifestyleAdvice: string;
}

interface FoodAnalysis {
  overallAssessment: string;
  whatToEat: string[];
  whatToAvoid: string[];
  mealSuggestions: string[];
  nutritionGaps: string[];
  progressFeedback: string;
}

interface MealPlan {
  breakfast: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    description: string;
  };
  lunch: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    description: string;
  };
  dinner: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    description: string;
  };
  snacks: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    description: string;
  }[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  tips: string[];
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E';

// Try multiple models in order of preference
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro'
];

const getGeminiURL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Rate limiting and caching
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly MIN_DELAY = 4000; // 4 seconds between requests (15 per minute = 4 second intervals)

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.MIN_DELAY) {
        const delay = this.MIN_DELAY - timeSinceLastRequest;
        console.log(`⏳ Rate limiting: waiting ${delay}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }

    this.processing = false;
  }
}

// Simple cache for responses
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📋 Using cached response for:', key.substring(0, 50) + '...');
      return cached.data;
    }
    return null;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log('💾 Cached response for:', key.substring(0, 50) + '...');
  }

  clear(): void {
    this.cache.clear();
  }
}

export class GeminiService {
  private requestQueue = new RequestQueue();
  private responseCache = new ResponseCache();
  private apiKey: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    console.log('🔑 Gemini API Key configured:', this.apiKey ? 'Yes' : 'No');
    console.log('🔑 API Key length:', this.apiKey?.length || 0);
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Testing Gemini API connection...');
      const testPrompt = "Respond with just the word 'connected' if you can read this.";
      const response = await this.callGeminiAPI(testPrompt);
      console.log('✅ Gemini API test response:', response);
      return response.toLowerCase().includes('connected');
    } catch (error) {
      console.error('❌ Gemini API connection test failed:', error);
      return false;
    }
  }
  private async callGeminiAPI(prompt: string, retries: number = 2): Promise<string> {
    // Check cache first
    const cacheKey = prompt.substring(0, 100);
    const cached = this.responseCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Use request queue to manage rate limiting
    return this.requestQueue.add(async () => {
      // Try each model in order
      for (const model of GEMINI_MODELS) {
        console.log(`🤖 Trying Gemini model: ${model}`);

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`🔄 API Call (Model: ${model}, Attempt ${attempt}/${retries})`);
            console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

            const requestBody = {
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024, // Reduced to save quota
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            };

            const response = await fetch(`${getGeminiURL(model)}?key=${this.apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Gemini API HTTP Error (${model}): ${response.status} - ${response.statusText}`);
          console.error('📄 Error Response:', errorText);

          // Parse error response for retry delay
          let retryDelay = 60000; // Default 1 minute
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.details) {
              const retryInfo = errorData.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
              if (retryInfo?.retryDelay) {
                const delayStr = retryInfo.retryDelay;
                const seconds = parseInt(delayStr.replace('s', ''));
                retryDelay = seconds * 1000;
              }
            }
          } catch (parseError) {
            console.log('Could not parse error response for retry delay');
          }

          // Handle different error types
          if (response.status === 404) {
            console.log(`🔄 Model ${model} not found, trying next model...`);
            break; // Try next model
          }

          if (response.status === 429) {
            console.log(`⏳ Rate limited! Suggested retry delay: ${retryDelay / 1000}s`);

            if (attempt < retries) {
              // Use shorter delay for retries, but respect minimum
              const waitTime = Math.min(retryDelay, 30000); // Max 30 seconds
              console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            } else {
              console.log(`🔄 Rate limit exceeded for ${model}, trying next model...`);
              break; // Try next model
            }
          }

          if (attempt === retries) {
            console.log(`🔄 All retries failed for ${model}, trying next model...`);
            break; // Try next model
          }

          throw new Error(`Gemini API HTTP ${response.status}: ${response.statusText}`);
        }

          const data = await response.json();
          console.log('📦 Raw API Response:', JSON.stringify(data, null, 2));

          // Extract text from response
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!responseText) {
            console.error('❌ No response text found in API response');
            console.error('📄 Full response:', JSON.stringify(data, null, 2));

            if (attempt === retries) {
              console.log(`🔄 No response text from ${model}, trying next model...`);
              break; // Try next model
            }

            throw new Error('No response text generated by Gemini');
          }

          console.log(`✅ Gemini API Success with model: ${model}`);
          console.log('📝 Response Text:', responseText.substring(0, 300) + '...');

          // Cache the successful response
          this.responseCache.set(cacheKey, responseText);

          return responseText;

        } catch (error) {
          console.error(`❌ Gemini API Error (${model}, Attempt ${attempt}/${retries}):`, error);

          if (attempt === retries) {
            console.log(`🔄 All retries failed for ${model}, trying next model...`);
            break; // Try next model
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

      throw new Error('All Gemini models and attempts failed');
    });
  }

  // Method to clear cache and reset rate limiting
  public clearCache(): void {
    console.log('🧹 Clearing response cache...');
    this.responseCache.clear();
  }

  // Method to check if we're likely to hit rate limits
  public getRateLimitStatus(): { canMakeRequest: boolean; suggestedDelay: number } {
    const now = Date.now();
    const timeSinceLastRequest = now - (this.requestQueue as any).lastRequestTime;
    const minDelay = 4000; // 4 seconds between requests

    if (timeSinceLastRequest < minDelay) {
      return {
        canMakeRequest: false,
        suggestedDelay: minDelay - timeSinceLastRequest
      };
    }

    return {
      canMakeRequest: true,
      suggestedDelay: 0
    };
  }

  private extractJSON(text: string): any {
    console.log('🔍 Extracting JSON from response...');
    console.log('📝 Raw text:', text);

    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to find JSON object in the text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    // Clean up common issues
    cleanText = cleanText
      .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();

    console.log('🧹 Cleaned text:', cleanText);

    try {
      const parsed = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Failed to parse:', cleanText);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }
  }

  async analyzeUserProfile(userData: UserData, nutritionResults: NutritionResults): Promise<AIAnalysis> {
    console.log('🔬 Starting user profile analysis...');

    // Check rate limit status
    const rateLimitStatus = this.getRateLimitStatus();
    if (!rateLimitStatus.canMakeRequest) {
      console.log(`⏳ Rate limit protection: waiting ${rateLimitStatus.suggestedDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, rateLimitStatus.suggestedDelay));
    }

    // Calculate age
    const birthDate = new Date(
      parseInt(userData.birthdate.year),
      parseInt(userData.birthdate.month) - 1,
      parseInt(userData.birthdate.day)
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

    // Calculate BMI
    const heightM = parseFloat(userData.height) / 100;
    const weightKg = parseFloat(userData.weight);
    const bmi = weightKg / (heightM * heightM);

    // Determine BMI category
    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return "underweight";
      if (bmi < 25) return "normal weight";
      if (bmi < 30) return "overweight";
      return "obese";
    };

    const bmiCategory = getBMICategory(bmi);
    const goalText = userData.goal === 'lose' ? 'lose weight' : userData.goal === 'gain' ? 'gain weight' : 'maintain weight';

    const prompt = `You are a certified nutritionist and fitness expert. Analyze this user's health profile and provide personalized recommendations.

IMPORTANT: You must respond with ONLY a valid JSON object. No additional text, explanations, or markdown formatting.

USER DATA:
- Age: ${age} years old
- Gender: ${userData.gender}
- Height: ${userData.height} cm (${(parseFloat(userData.height) / 2.54 / 12).toFixed(1)} feet)
- Weight: ${userData.weight} kg (${(parseFloat(userData.weight) * 2.20462).toFixed(1)} lbs)
- BMI: ${bmi.toFixed(1)} (${bmiCategory})
- Primary Goal: ${goalText}
- Exercise Frequency: ${userData.workoutFrequency} days per week

NUTRITION TARGETS:
- Daily Calories: ${nutritionResults.calories} kcal
- Protein: ${nutritionResults.protein}g (${((nutritionResults.protein * 4 / nutritionResults.calories) * 100).toFixed(0)}% of calories)
- Carbohydrates: ${nutritionResults.carbs}g (${((nutritionResults.carbs * 4 / nutritionResults.calories) * 100).toFixed(0)}% of calories)
- Fats: ${nutritionResults.fats}g (${((nutritionResults.fats * 9 / nutritionResults.calories) * 100).toFixed(0)}% of calories)
- BMR: ${nutritionResults.debugInfo.calculatedValues.bmr} kcal
- TDEE: ${nutritionResults.debugInfo.calculatedValues.tdee} kcal

Respond with this exact JSON structure:
{
  "healthAssessment": "Professional assessment of their current health status, BMI category, and how their goal aligns with their profile (2-3 sentences)",
  "personalizedTips": [
    "Specific tip 1 based on their BMI and goal",
    "Specific tip 2 based on their exercise frequency",
    "Specific tip 3 based on their age and gender",
    "Specific tip 4 based on their nutrition targets"
  ],
  "warnings": [${bmi < 18.5 || bmi > 30 ? '"Consult with a healthcare provider for personalized medical advice"' : ''}],
  "motivationalMessage": "Encouraging message specifically tailored to their goal and current status",
  "nutritionRecommendations": "Detailed nutrition advice based on their calculated macros and goal",
  "exerciseRecommendations": "Exercise suggestions that complement their ${userData.workoutFrequency} days/week schedule and ${goalText} goal",
  "lifestyleAdvice": "Lifestyle recommendations that support their ${goalText} goal and overall health"
}`;

    try {
      console.log('📤 Sending profile analysis request to Gemini...');
      const response = await this.callGeminiAPI(prompt);

      try {
        const analysis = this.extractJSON(response);

        // Validate the response structure
        if (!analysis.healthAssessment || !analysis.personalizedTips || !Array.isArray(analysis.personalizedTips)) {
          throw new Error('Invalid response structure from Gemini');
        }

        console.log('✅ Profile analysis completed successfully');
        return analysis as AIAnalysis;

      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', parseError);
        console.log('🔄 Using fallback analysis...');
        return this.createFallbackAnalysis(response, userData, bmi);
      }
    } catch (error) {
      console.error('❌ Error getting AI analysis:', error);

      // Check if it's a rate limit error
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('🚫 Rate limit exceeded - using enhanced fallback analysis...');
        return this.createEnhancedFallbackAnalysis(userData, nutritionResults, bmi);
      }

      console.log('🔄 Using default analysis...');
      return this.createDefaultAnalysis(userData, bmi);
    }
  }

  private createFallbackAnalysis(response: string, userData: UserData, bmi: number): AIAnalysis {
    return {
      healthAssessment: `Based on your profile, you have a BMI of ${bmi.toFixed(1)}. ${response.substring(0, 200)}...`,
      personalizedTips: [
        "Stay consistent with your nutrition plan",
        "Track your progress regularly",
        "Stay hydrated throughout the day",
        "Get adequate sleep for recovery"
      ],
      warnings: bmi < 18.5 || bmi > 30 ? ["Please consult with a healthcare provider for personalized advice"] : [],
      motivationalMessage: "You're taking a great step towards better health! Stay committed to your goals.",
      nutritionRecommendations: "Follow your calculated macro targets and focus on whole, nutrient-dense foods.",
      exerciseRecommendations: `With ${userData.workoutFrequency} workout days per week, focus on consistency and progressive overload.`,
      lifestyleAdvice: "Maintain a regular sleep schedule and manage stress levels for optimal results."
    };
  }

  private createEnhancedFallbackAnalysis(userData: UserData, nutritionResults: NutritionResults, bmi: number): AIAnalysis {
    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return "underweight";
      if (bmi < 25) return "normal weight";
      if (bmi < 30) return "overweight";
      return "obese";
    };

    const bmiCategory = getBMICategory(bmi);
    const goalText = userData.goal === 'lose' ? 'lose weight' : userData.goal === 'gain' ? 'gain weight' : 'maintain weight';

    // Calculate some basic metrics
    const proteinPerKg = (nutritionResults.protein / parseFloat(userData.weight)).toFixed(1);
    const calorieDeficit = userData.goal === 'lose' ? 'moderate calorie deficit' : userData.goal === 'gain' ? 'calorie surplus' : 'maintenance calories';

    return {
      healthAssessment: `Your BMI of ${bmi.toFixed(1)} places you in the ${bmiCategory} category. Your goal to ${goalText} is well-supported by your personalized nutrition plan of ${nutritionResults.calories} calories daily. This plan provides ${proteinPerKg}g protein per kg body weight, which is excellent for your goals.`,
      personalizedTips: [
        `Focus on ${calorieDeficit} with your ${nutritionResults.calories} calorie target`,
        `Prioritize ${nutritionResults.protein}g protein daily (${proteinPerKg}g per kg body weight)`,
        `Your ${userData.workoutFrequency} days/week exercise schedule is perfect for ${userData.goal === 'lose' ? 'fat loss' : userData.goal === 'gain' ? 'muscle building' : 'maintenance'}`,
        `Track your macros: ${nutritionResults.carbs}g carbs and ${nutritionResults.fats}g fats daily`
      ],
      warnings: bmi < 18.5 || bmi > 30 ? ["Consider consulting with a healthcare provider for personalized medical guidance"] : [],
      motivationalMessage: `You're on the right track! Your personalized plan is designed specifically for your ${userData.goal} goal. With ${userData.workoutFrequency} workout days per week and proper nutrition tracking, you'll see great results. Stay consistent and trust the process!`,
      nutritionRecommendations: `Your macro split is optimized for ${goalText}: ${((nutritionResults.protein * 4 / nutritionResults.calories) * 100).toFixed(0)}% protein, ${((nutritionResults.carbs * 4 / nutritionResults.calories) * 100).toFixed(0)}% carbs, ${((nutritionResults.fats * 9 / nutritionResults.calories) * 100).toFixed(0)}% fats. Focus on whole foods: lean proteins, complex carbs, healthy fats, and plenty of vegetables.`,
      exerciseRecommendations: `Your ${userData.workoutFrequency} days/week schedule is ideal. ${userData.goal === 'lose' ? 'Combine strength training with cardio for optimal fat loss while preserving muscle.' : userData.goal === 'gain' ? 'Focus on progressive overload in strength training with adequate rest for muscle growth.' : 'Maintain a balanced mix of strength and cardio for overall fitness.'}`,
      lifestyleAdvice: `Consistency is key for ${goalText}. Get 7-9 hours of sleep, stay hydrated, manage stress, and be patient with the process. Small daily actions compound into significant results over time.`
    };
  }

  private createDefaultAnalysis(userData: UserData, bmi: number): AIAnalysis {
    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return "underweight";
      if (bmi < 25) return "normal weight";
      if (bmi < 30) return "overweight";
      return "obese";
    };

    const bmiCategory = getBMICategory(bmi);

    return {
      healthAssessment: `Your BMI of ${bmi.toFixed(1)} places you in the ${bmiCategory} category. Your goal to ${userData.goal} weight aligns well with improving your overall health.`,
      personalizedTips: [
        "Focus on creating a sustainable calorie deficit through diet and exercise",
        "Prioritize protein intake to maintain muscle mass",
        "Include strength training in your workout routine",
        "Monitor your progress weekly, not daily"
      ],
      warnings: bmi < 18.5 || bmi > 30 ? ["Consider consulting with a healthcare provider for personalized guidance"] : [],
      motivationalMessage: "Every journey begins with a single step. You've already taken that step by creating your personalized plan!",
      nutritionRecommendations: "Stick to your calculated macros and focus on whole foods like lean proteins, vegetables, fruits, and whole grains.",
      exerciseRecommendations: `Your ${userData.workoutFrequency} days per week workout schedule is excellent. Combine cardio with strength training for best results.`,
      lifestyleAdvice: "Consistency is key. Small, sustainable changes will lead to lasting results."
    };
  }

  async analyzeFoodLogs(
    userData: UserData,
    nutritionResults: NutritionResults,
    recentLogs: NutritionLog[]
  ): Promise<FoodAnalysis> {
    console.log('🍽️ Starting food log analysis...');

    // Calculate age and BMI
    const birthDate = new Date(
      parseInt(userData.birthdate.year),
      parseInt(userData.birthdate.month) - 1,
      parseInt(userData.birthdate.day)
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const heightM = parseFloat(userData.height) / 100;
    const weightKg = parseFloat(userData.weight);
    const bmi = weightKg / (heightM * heightM);

    // Calculate current totals from recent logs
    const totalCalories = recentLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = recentLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = recentLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFats = recentLogs.reduce((sum, log) => sum + log.fats, 0);

    // Calculate percentages
    const calorieProgress = (totalCalories / nutritionResults.calories) * 100;
    const proteinProgress = (totalProtein / nutritionResults.protein) * 100;
    const carbProgress = (totalCarbs / nutritionResults.carbs) * 100;
    const fatProgress = (totalFats / nutritionResults.fats) * 100;

    // Calculate remaining amounts
    const caloriesRemaining = Math.max(0, nutritionResults.calories - totalCalories);
    const proteinRemaining = Math.max(0, nutritionResults.protein - totalProtein);
    const carbsRemaining = Math.max(0, nutritionResults.carbs - totalCarbs);
    const fatsRemaining = Math.max(0, nutritionResults.fats - totalFats);

    const foodDescriptions = recentLogs.length > 0
      ? recentLogs.map(log => `• ${log.description} (${log.calories} cal, ${log.protein}g protein, ${log.carbs}g carbs, ${log.fats}g fats)`).join('\n')
      : 'No food logged yet today';

    const goalText = userData.goal === 'lose' ? 'lose weight' : userData.goal === 'gain' ? 'gain weight' : 'maintain weight';

    const prompt = `You are a certified nutritionist. Analyze this user's daily food intake and provide specific recommendations.

IMPORTANT: Respond with ONLY a valid JSON object. No additional text or formatting.

USER PROFILE:
- ${age} year old ${userData.gender}
- BMI: ${bmi.toFixed(1)}
- Goal: ${goalText}
- Exercise: ${userData.workoutFrequency} days/week

TODAY'S NUTRITION TARGETS:
- Calories: ${nutritionResults.calories} kcal
- Protein: ${nutritionResults.protein}g
- Carbohydrates: ${nutritionResults.carbs}g
- Fats: ${nutritionResults.fats}g

FOOD CONSUMED TODAY:
${foodDescriptions}

CURRENT PROGRESS:
- Calories: ${totalCalories}/${nutritionResults.calories} (${calorieProgress.toFixed(1)}%) - ${caloriesRemaining} remaining
- Protein: ${totalProtein}/${nutritionResults.protein}g (${proteinProgress.toFixed(1)}%) - ${proteinRemaining}g remaining
- Carbs: ${totalCarbs}/${nutritionResults.carbs}g (${carbProgress.toFixed(1)}%) - ${carbsRemaining}g remaining
- Fats: ${totalFats}/${nutritionResults.fats}g (${fatProgress.toFixed(1)}%) - ${fatsRemaining}g remaining

Respond with this exact JSON structure:
{
  "overallAssessment": "Brief assessment of their current food choices and progress toward daily targets",
  "whatToEat": [
    "Specific food 1 to address their biggest nutritional gap",
    "Specific food 2 to support their ${goalText} goal",
    "Specific food 3 based on remaining macros"
  ],
  "whatToAvoid": [
    "Food type 1 they should limit based on current intake",
    "Food type 2 that doesn't align with their goal"
  ],
  "mealSuggestions": [
    "Specific meal idea 1 with approximate macros",
    "Specific meal idea 2 that fits remaining calories"
  ],
  "nutritionGaps": [
    "Specific nutrient gap or excess based on current vs target intake"
  ],
  "progressFeedback": "Encouraging feedback with specific next steps for the rest of the day"
}`;

    try {
      console.log('📤 Sending food analysis request to Gemini...');
      const response = await this.callGeminiAPI(prompt);

      try {
        const analysis = this.extractJSON(response);

        // Validate response structure
        if (!analysis.overallAssessment || !Array.isArray(analysis.whatToEat)) {
          throw new Error('Invalid food analysis response structure');
        }

        console.log('✅ Food analysis completed successfully');
        return analysis as FoodAnalysis;

      } catch (parseError) {
        console.error('❌ Failed to parse food analysis JSON:', parseError);
        console.log('🔄 Using fallback food analysis...');
        return this.createFallbackFoodAnalysis(userData, totalCalories, nutritionResults.calories);
      }
    } catch (error) {
      console.error('❌ Error getting food analysis:', error);
      console.log('🔄 Using fallback food analysis...');
      return this.createFallbackFoodAnalysis(userData, totalCalories, nutritionResults.calories);
    }
  }

  private createFallbackFoodAnalysis(userData: UserData, currentCalories: number, targetCalories: number): FoodAnalysis {
    const calorieProgress = (currentCalories / targetCalories) * 100;

    return {
      overallAssessment: `You've consumed ${currentCalories} out of ${targetCalories} calories today (${calorieProgress.toFixed(1)}%).`,
      whatToEat: [
        "Lean proteins like chicken breast, fish, or tofu",
        "Complex carbohydrates like quinoa, sweet potatoes, or brown rice",
        "Healthy fats from avocados, nuts, or olive oil",
        "Plenty of vegetables for vitamins and fiber"
      ],
      whatToAvoid: [
        "Processed foods high in added sugars",
        "Fried foods and excessive saturated fats",
        "Sugary drinks and alcohol"
      ],
      mealSuggestions: [
        "Grilled chicken with roasted vegetables and quinoa",
        "Salmon with sweet potato and steamed broccoli",
        "Greek yogurt with berries and nuts"
      ],
      nutritionGaps: calorieProgress < 80 ? ["You may need more calories to meet your daily target"] :
                     calorieProgress > 120 ? ["Consider reducing portion sizes to stay within your calorie goal"] :
                     ["Your calorie intake looks good so far"],
      progressFeedback: `Keep up the good work! Focus on ${userData.goal === 'lose' ? 'maintaining your calorie deficit' : userData.goal === 'gain' ? 'eating enough to support muscle growth' : 'balanced nutrition'}.`
    };
  }

  async getQuickTip(userData: Partial<UserData>): Promise<string> {
    console.log('💡 Getting quick tip...');

    const goalText = userData.goal === 'lose' ? 'lose weight' : userData.goal === 'gain' ? 'gain weight' : 'maintain weight';

    const prompt = `You are a motivational fitness coach. Give a brief, encouraging tip for someone with this profile.

USER: ${userData.gender || 'person'} who wants to ${goalText} and exercises ${userData.workoutFrequency || '3-5'} days per week.

Provide a motivational tip that is:
- 1-2 sentences maximum
- Specific to their goal
- Actionable and encouraging
- Professional and supportive

Respond with ONLY the tip text, no quotes or additional formatting.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const tip = response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
      console.log('✅ Quick tip generated:', tip);
      return tip;
    } catch (error) {
      console.error('❌ Error getting quick tip:', error);

      // Return goal-specific fallback
      const fallbacks = {
        lose: "Focus on creating a sustainable calorie deficit through balanced nutrition and consistent exercise. Small changes lead to lasting results!",
        gain: "Prioritize protein intake and progressive overload in your workouts to support healthy muscle growth. Consistency is your best friend!",
        maintain: "Keep up your balanced approach to nutrition and exercise. Maintaining your health is just as important as any transformation!"
      };

      return fallbacks[userData.goal as keyof typeof fallbacks] || "Stay consistent with your plan and trust the process. Small daily actions lead to big results!";
    }
  }

  async generateMealPlan(
    userData: UserData,
    nutritionResults: NutritionResults,
    preferences?: string[]
  ): Promise<MealPlan> {
    console.log('🍽️ Starting meal plan generation...');

    // Calculate age and BMI
    const birthDate = new Date(
      parseInt(userData.birthdate.year),
      parseInt(userData.birthdate.month) - 1,
      parseInt(userData.birthdate.day)
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

    const heightM = parseFloat(userData.height) / 100;
    const weightKg = parseFloat(userData.weight);
    const bmi = weightKg / (heightM * heightM);

    const goalText = userData.goal === 'lose' ? 'lose weight' : userData.goal === 'gain' ? 'gain weight' : 'maintain weight';
    const preferencesText = preferences && preferences.length > 0 ? preferences.join(', ') : 'no specific preferences';

    const prompt = `You are a certified nutritionist. Create a detailed daily meal plan for this user.

IMPORTANT: You must respond with ONLY a valid JSON object. No additional text, explanations, or markdown formatting.

USER PROFILE:
- Age: ${age} years old
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- BMI: ${bmi.toFixed(1)}
- Goal: ${goalText}
- Exercise: ${userData.workoutFrequency} days per week
- Preferences: ${preferencesText}

NUTRITION TARGETS:
- Daily Calories: ${nutritionResults.calories} kcal
- Protein: ${nutritionResults.protein}g
- Carbohydrates: ${nutritionResults.carbs}g
- Fats: ${nutritionResults.fats}g

Create a balanced meal plan that meets these exact targets. Distribute calories as: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%.

Respond with this exact JSON structure:
{
  "breakfast": {
    "name": "Specific breakfast name",
    "calories": ${Math.round(nutritionResults.calories * 0.25)},
    "protein": ${Math.round(nutritionResults.protein * 0.3)},
    "carbs": ${Math.round(nutritionResults.carbs * 0.25)},
    "fats": ${Math.round(nutritionResults.fats * 0.25)},
    "description": "Detailed description with specific foods and portions"
  },
  "lunch": {
    "name": "Specific lunch name",
    "calories": ${Math.round(nutritionResults.calories * 0.35)},
    "protein": ${Math.round(nutritionResults.protein * 0.4)},
    "carbs": ${Math.round(nutritionResults.carbs * 0.35)},
    "fats": ${Math.round(nutritionResults.fats * 0.35)},
    "description": "Detailed description with specific foods and portions"
  },
  "dinner": {
    "name": "Specific dinner name",
    "calories": ${Math.round(nutritionResults.calories * 0.3)},
    "protein": ${Math.round(nutritionResults.protein * 0.25)},
    "carbs": ${Math.round(nutritionResults.carbs * 0.3)},
    "fats": ${Math.round(nutritionResults.fats * 0.3)},
    "description": "Detailed description with specific foods and portions"
  },
  "snacks": [{
    "name": "Healthy snack",
    "calories": ${Math.round(nutritionResults.calories * 0.1)},
    "protein": ${Math.round(nutritionResults.protein * 0.05)},
    "carbs": ${Math.round(nutritionResults.carbs * 0.1)},
    "fats": ${Math.round(nutritionResults.fats * 0.1)},
    "description": "Specific snack with portion size"
  }],
  "totalNutrition": {
    "calories": ${nutritionResults.calories},
    "protein": ${nutritionResults.protein},
    "carbs": ${nutritionResults.carbs},
    "fats": ${nutritionResults.fats}
  },
  "tips": [
    "Specific tip 1 for meal timing",
    "Specific tip 2 for food preparation",
    "Specific tip 3 for ${goalText} goal",
    "Specific tip 4 for hydration and lifestyle"
  ]
}`;

    try {
      console.log('📤 Sending meal plan request to Gemini...');
      const response = await this.callGeminiAPI(prompt);

      try {
        const mealPlan = this.extractJSON(response);

        // Validate response structure
        if (!mealPlan.breakfast || !mealPlan.lunch || !mealPlan.dinner) {
          throw new Error('Invalid meal plan response structure');
        }

        console.log('✅ Meal plan generated successfully');
        return mealPlan as MealPlan;

      } catch (parseError) {
        console.error('❌ Failed to parse meal plan JSON:', parseError);
        console.log('🔄 Using fallback meal plan...');
        return this.createFallbackMealPlan(nutritionResults, userData);
      }
    } catch (error) {
      console.error('❌ Error generating meal plan:', error);
      console.log('🔄 Using fallback meal plan...');
      return this.createFallbackMealPlan(nutritionResults, userData);
    }
  }

  private createFallbackMealPlan(nutritionResults: NutritionResults, userData: UserData): MealPlan {
    const goalText = userData.goal === 'lose' ? 'weight loss' : userData.goal === 'gain' ? 'muscle gain' : 'maintenance';

    return {
      breakfast: {
        name: "Protein Power Breakfast",
        calories: Math.round(nutritionResults.calories * 0.25),
        protein: Math.round(nutritionResults.protein * 0.3),
        carbs: Math.round(nutritionResults.carbs * 0.25),
        fats: Math.round(nutritionResults.fats * 0.25),
        description: "2 eggs, 1 slice whole grain toast, 1/2 avocado, and 1 cup berries"
      },
      lunch: {
        name: "Balanced Power Bowl",
        calories: Math.round(nutritionResults.calories * 0.35),
        protein: Math.round(nutritionResults.protein * 0.4),
        carbs: Math.round(nutritionResults.carbs * 0.35),
        fats: Math.round(nutritionResults.fats * 0.35),
        description: "150g grilled chicken, 1 cup quinoa, mixed vegetables, and olive oil dressing"
      },
      dinner: {
        name: "Light & Nutritious Dinner",
        calories: Math.round(nutritionResults.calories * 0.3),
        protein: Math.round(nutritionResults.protein * 0.25),
        carbs: Math.round(nutritionResults.carbs * 0.3),
        fats: Math.round(nutritionResults.fats * 0.3),
        description: "120g salmon, steamed broccoli, and sweet potato"
      },
      snacks: [{
        name: "Protein Snack",
        calories: Math.round(nutritionResults.calories * 0.1),
        protein: Math.round(nutritionResults.protein * 0.05),
        carbs: Math.round(nutritionResults.carbs * 0.1),
        fats: Math.round(nutritionResults.fats * 0.1),
        description: "Greek yogurt with a handful of almonds"
      }],
      totalNutrition: {
        calories: nutritionResults.calories,
        protein: nutritionResults.protein,
        carbs: nutritionResults.carbs,
        fats: nutritionResults.fats
      },
      tips: [
        "Drink water 30 minutes before each meal",
        "Eat slowly and chew thoroughly",
        `This plan is optimized for ${goalText}`,
        "Adjust portion sizes based on hunger and energy levels"
      ]
    };
  }

  async analyzeFoodImage(base64Image: string): Promise<any> {
    console.log('🍽️ Starting food image analysis with Gemini...');

    const prompt = `You are an expert nutritionist and food recognition specialist. Your job is to identify and analyze ALL types of food items including:

🍎 FRUITS: Raw fruits (apple, mango, banana, orange, berries, etc.), cut fruits, fruit salads
🥕 VEGETABLES: Raw vegetables (carrot, tomato, cucumber, etc.), cooked vegetables, salads
🍞 GRAINS: Rice, bread, pasta, cereals, quinoa, oats
🥩 PROTEINS: Meat, fish, chicken, eggs, beans, lentils, tofu, nuts
🥛 DAIRY: Milk, cheese, yogurt, butter
🍰 PREPARED FOODS: Cooked meals, snacks, desserts, beverages

IDENTIFICATION RULES:
✅ IDENTIFY AS FOOD: Any edible item including raw fruits/vegetables, cooked meals, snacks, beverages
❌ REJECT ONLY: Empty plates, utensils only, non-edible objects, unclear/blurry images

SPECIAL FOCUS:
- RAW FRUITS & VEGETABLES: Always identify these (mango, apple, carrot, etc.)
- PORTION ESTIMATION: Estimate realistic serving sizes
- NUTRITION ACCURACY: Provide accurate nutrition data based on standard food databases

RESPONSE FORMAT: You must respond with ONLY a valid JSON object. No additional text.

For ANY FOOD ITEM (including raw fruits/vegetables):
{
  "is_food": true,
  "description": "Detailed description with estimated portion size (e.g., '1 medium raw mango, approximately 200g')",
  "health_suggestion": "Specific health benefits and advice for this food",
  "calories": [accurate calories for the estimated portion],
  "protein": [grams of protein],
  "carbs": [grams of carbohydrates],
  "fats": [grams of fats],
  "confidence": "high/medium/low"
}

For NON-FOOD items only:
{
  "is_food": false,
  "description": "This appears to be [what you see] - not a food item",
  "health_suggestion": "Please take a photo of food for nutrition analysis",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "confidence": "high"
}

EXAMPLES OF WHAT TO IDENTIFY AS FOOD:
✅ Raw mango → "1 medium raw mango, approximately 200g" with accurate nutrition
✅ Apple slices → "1 medium sliced apple, approximately 150g" with nutrition
✅ Cooked rice → "1 cup cooked rice, approximately 200g" with nutrition
✅ Glass of milk → "1 cup whole milk, approximately 240ml" with nutrition

Remember: Your primary job is to IDENTIFY and ANALYZE food items, not to reject them. Be comprehensive in food recognition!`;

    try {
      console.log('📤 Sending food image to Gemini...');

      // For image analysis, we need to use a different API call format
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Gemini response received:', data);

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('📝 Gemini response text:', responseText);

        try {
          const foodAnalysis = this.extractJSON(responseText);

          // Validate response structure
          if (!foodAnalysis.description || typeof foodAnalysis.calories !== 'number') {
            throw new Error('Invalid food analysis response structure');
          }

          // Check if it's actually food
          if (foodAnalysis.is_food === false) {
            console.log('⚠️ Non-food item detected:', foodAnalysis.description);
            return {
              description: foodAnalysis.description,
              health_suggestion: foodAnalysis.health_suggestion,
              calories: 0,
              protein: 0,
              carbs: 0,
              fats: 0,
              is_food: false,
              confidence: foodAnalysis.confidence || 'high'
            };
          }

          // Validate nutrition values for food items
          if (foodAnalysis.is_food === true) {
            // Check for unrealistic values
            if (foodAnalysis.calories > 2000 || foodAnalysis.protein > 100 ||
                foodAnalysis.carbs > 200 || foodAnalysis.fats > 100) {
              console.warn('⚠️ Unrealistic nutrition values detected, adjusting...');
              foodAnalysis.calories = Math.min(foodAnalysis.calories, 800);
              foodAnalysis.protein = Math.min(foodAnalysis.protein, 50);
              foodAnalysis.carbs = Math.min(foodAnalysis.carbs, 100);
              foodAnalysis.fats = Math.min(foodAnalysis.fats, 30);
            }
          }

          console.log('✅ Food image analysis completed successfully');
          return foodAnalysis;

        } catch (parseError) {
          console.error('❌ Failed to parse food analysis JSON:', parseError);
          console.log('🔄 Using fallback food analysis...');
          return this.createFallbackImageAnalysis();
        }
      } else {
        console.error('❌ Invalid response structure from Gemini:', data);
        throw new Error(`Invalid response structure from Gemini: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('❌ Error analyzing food image:', error);
      console.log('🔄 Using fallback food analysis...');
      return this.createFallbackImageAnalysis();
    }
  }

  private createFallbackImageAnalysis(): any {
    return {
      description: "Food item detected (AI analysis temporarily unavailable)",
      health_suggestion: "This appears to be a food item. Please verify nutrition information or try taking another photo with better lighting.",
      calories: 100,
      protein: 2,
      carbs: 20,
      fats: 1,
      is_food: true,
      confidence: "low"
    };
  }
}

export const geminiService = new GeminiService();
