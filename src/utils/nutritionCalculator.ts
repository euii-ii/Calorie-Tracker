
interface UserData {
  height: string; // in cm
  weight: string; // in kg
  birthdate: {
    month: string;
    day: string;
    year: string;
  };
  workoutFrequency: string; // "0-2", "3-5", "6+"
  goal: string; // "lose", "maintain", "gain"
  gender: string; // "male", "female", "other"
}

interface NutritionResults {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weightLossGoal?: number;
  targetDate?: string;
  debugInfo: {
    inputValues: {
      height: string;
      weight: string;
      gender: string;
      age: number;
      workoutFrequency: string;
      goal: string;
    };
    calculatedValues: {
      bmr: number;
      tdee: number;
      targetCalories: number;
      weeklyGoal: string;
      targetDate: string;
    };
    macronutrientCalculations: {
      protein: {
        grams: number;
        calories: number;
        formula: string;
      };
      fats: {
        grams: number;
        calories: number;
        formula: string;
      };
      carbs: {
        grams: number;
        calories: number;
        formula: string;
      };
    };
    totals: {
      totalCalories: number;
    };
  };
}

export const calculateNutrition = (userData: UserData): NutritionResults => {
  console.log("Starting nutrition calculation with userData:", userData);

  // Age Calculation
  const birthDate = new Date(
    parseInt(userData.birthdate.year),
    parseInt(userData.birthdate.month) - 1,
    parseInt(userData.birthdate.day)
  );
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear() - 
    (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
  
  console.log("Calculated age:", age);

  // Input values
  const weightKg = parseFloat(userData.weight);
  const heightCm = parseFloat(userData.height);
  
  console.log("Weight (kg):", weightKg, "Height (cm):", heightCm);

  // BMR Calculation (Mifflin-St Jeor Formula)
  let bmr: number;
  if (userData.gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (userData.gender === "female") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // For "other", use average of male and female formulas
    const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }
  
  console.log("BMR:", bmr);

  // Activity Factor
  let activityFactor: number;
  switch (userData.workoutFrequency) {
    case "0-2":
      activityFactor = 1.2;
      break;
    case "3-5":
      activityFactor = 1.375;
      break;
    case "6+":
      activityFactor = 1.55;
      break;
    default:
      activityFactor = 1.2;
  }
  
  console.log("Activity factor:", activityFactor);

  // TDEE Calculation
  const tdee = bmr * activityFactor;
  console.log("TDEE:", tdee);

  // Goal Adjustment
  let targetCalories: number;
  let weightLossGoal: number | undefined;
  let targetDate: string | undefined;
  let weeklyGoal: string;

  switch (userData.goal) {
    case "lose":
      // Target weight loss of 1 kg per week (safe rate)
      const targetWeightLossKg = 1;
      targetCalories = tdee - (targetWeightLossKg * 7700 / 7); // 7700 cal per kg, divided by 7 days
      weightLossGoal = targetWeightLossKg * 2.205; // Convert to pounds for display
      weeklyGoal = `${targetWeightLossKg} kg`;
      
      // Target date is 1 week from now
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      targetDate = nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      break;
    case "maintain":
      targetCalories = tdee;
      weeklyGoal = "0 kg";
      targetDate = "Ongoing";
      break;
    case "gain":
      targetCalories = tdee * 1.15;
      weeklyGoal = "0.5 kg";
      const gainDate = new Date();
      gainDate.setDate(gainDate.getDate() + 7);
      targetDate = gainDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      break;
    default:
      targetCalories = tdee;
      weeklyGoal = "0 kg";
      targetDate = "Ongoing";
  }
  
  console.log("Target calories:", targetCalories);

  // Macronutrient Breakdown
  const proteinG = 2.2 * weightKg;
  const proteinCal = proteinG * 4;
  
  const fatG = 0.88 * weightKg;
  const fatCal = fatG * 9;
  
  const carbsCal = targetCalories - (proteinCal + fatCal);
  const carbsG = carbsCal / 4;

  console.log("Protein:", proteinG, "g (", proteinCal, "cal)");
  console.log("Fat:", fatG, "g (", fatCal, "cal)");
  console.log("Carbs:", carbsG, "g (", carbsCal, "cal)");

  const results: NutritionResults = {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbsG),
    fats: Math.round(fatG),
    weightLossGoal: weightLossGoal ? Math.round(weightLossGoal * 10) / 10 : undefined,
    targetDate,
    debugInfo: {
      inputValues: {
        height: `${heightCm} cm`,
        weight: `${weightKg} kg`,
        gender: userData.gender,
        age: age,
        workoutFrequency: userData.workoutFrequency,
        goal: userData.goal
      },
      calculatedValues: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        weeklyGoal: weeklyGoal,
        targetDate: targetDate || "Ongoing"
      },
      macronutrientCalculations: {
        protein: {
          grams: Math.round(proteinG),
          calories: Math.round(proteinCal),
          formula: "2.2 * weight_kg"
        },
        fats: {
          grams: Math.round(fatG),
          calories: Math.round(fatCal),
          formula: "0.88 * weight_kg"
        },
        carbs: {
          grams: Math.round(carbsG),
          calories: Math.round(carbsCal),
          formula: "remaining calories / 4"
        }
      },
      totals: {
        totalCalories: Math.round(proteinCal + fatCal + carbsCal)
      }
    }
  };

  console.log("Final results:", results);
  return results;
};
