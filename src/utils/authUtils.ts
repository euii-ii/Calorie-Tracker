export const clearUserData = () => {
  // Clear all user-related data from localStorage
  localStorage.removeItem('userHeight');
  localStorage.removeItem('userWeight');
  localStorage.removeItem('workoutFrequency');
  localStorage.removeItem('goal');
  localStorage.removeItem('gender');
  localStorage.removeItem('birthdate');
  localStorage.removeItem('nutritionPlan');
  localStorage.removeItem('nutritionLogs');
  localStorage.removeItem('aiAnalysis');
  localStorage.removeItem('aiAnalysisDate');
  localStorage.removeItem('onboardingData');
  localStorage.removeItem('isLoggedIn');
};
