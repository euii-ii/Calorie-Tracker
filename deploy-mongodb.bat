@echo off
echo 🚀 Deploying Easy Calorie Guide with MongoDB Integration
echo.

echo 📋 Configuration Summary:
echo - Frontend: React + Vite
echo - Database: MongoDB Atlas (Direct Connection)
echo - API: Vercel Serverless Functions
echo - Authentication: Clerk
echo - AI: Gemini API
echo.

echo 🔧 Setting up environment variables...
echo.

REM Set environment variables for Vercel
echo Setting VITE_CLERK_PUBLISHABLE_KEY...
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
echo pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ

echo.
echo Setting VITE_MONGODB_URI...
vercel env add VITE_MONGODB_URI production
echo mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker

echo.
echo Setting VITE_GEMINI_API_KEY...
vercel env add VITE_GEMINI_API_KEY production
echo AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E

echo.
echo Setting VITE_API_URL...
vercel env add VITE_API_URL production
echo /api

echo.
echo Setting MONGODB_URI (for serverless functions)...
vercel env add MONGODB_URI production
echo mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker

echo.
echo 🏗️ Building project...
npm run build

echo.
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment Complete!
echo.
echo 🔗 Your app should be available at: https://easy-calorie-guide-main.vercel.app/
echo.
echo 📋 API Endpoints:
echo - Health Check: https://easy-calorie-guide-main.vercel.app/api/health
echo - Users: https://easy-calorie-guide-main.vercel.app/api/users
echo - Sessions: https://easy-calorie-guide-main.vercel.app/api/sessions
echo - Food Logs: https://easy-calorie-guide-main.vercel.app/api/food-logs
echo.
echo 🧪 Test the deployment:
echo 1. Visit the health endpoint to verify MongoDB connection
echo 2. Sign in to test authentication
echo 3. Complete onboarding to test data storage
echo 4. Use the camera feature to test AI integration
echo.
pause
