@echo off
echo 🔧 Setting Vercel Environment Variables for MongoDB Connection
echo.

echo Setting MONGODB_URI...
vercel env add MONGODB_URI production
echo mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker

echo.
echo Setting GEMINI_API_KEY...
vercel env add GEMINI_API_KEY production
echo AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E

echo.
echo Setting CLERK_PUBLISHABLE_KEY...
vercel env add CLERK_PUBLISHABLE_KEY production
echo pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ

echo.
echo ✅ Environment variables set! Now redeploying...
npx vercel --prod

echo.
echo 🧪 Test the health endpoint:
echo https://easy-calorie-guide-main.vercel.app/api/health
echo.
pause
