#!/bin/bash

# 🚀 Easy Calorie Guide - Deployment Script
echo "🚀 Starting deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Deployment Steps:"
echo "1. Deploy backend first"
echo "2. Deploy frontend with updated API URL"
echo "3. Update backend CORS settings"
echo ""

# Step 1: Deploy Backend
echo "🔧 Step 1: Deploying backend..."
cd server

echo "📝 Setting up backend environment variables..."
echo "Please set the following environment variables in Vercel:"
echo "- MONGODB_URI: mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker"
echo "- FRONTEND_URL: (will be updated after frontend deployment)"
echo ""

read -p "Press Enter to deploy backend to Vercel..."
vercel --prod

echo "✅ Backend deployed!"
echo "📝 Please note your backend URL from the output above"
read -p "Enter your backend URL (e.g., https://your-backend.vercel.app): " BACKEND_URL

# Step 2: Update Frontend Environment
echo ""
echo "🔧 Step 2: Updating frontend environment..."
cd ..

# Update .env.local with the backend URL
echo "# Production Environment Variables" > .env.local
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ" >> .env.local
echo "VITE_MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker" >> .env.local
echo "VITE_GEMINI_API_KEY=AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E" >> .env.local
echo "VITE_API_URL=${BACKEND_URL}/api" >> .env.local

echo "✅ Updated .env.local with backend URL: ${BACKEND_URL}/api"

# Build and deploy frontend
echo ""
echo "🔧 Building frontend..."
npm run build

echo "🚀 Deploying frontend..."
vercel --prod

echo "✅ Frontend deployed!"
echo "📝 Please note your frontend URL from the output above"
read -p "Enter your frontend URL (e.g., https://your-frontend.vercel.app): " FRONTEND_URL

# Step 3: Update Backend CORS
echo ""
echo "🔧 Step 3: Updating backend CORS settings..."
cd server

echo "Setting FRONTEND_URL environment variable..."
vercel env add FRONTEND_URL production
echo "Please enter: ${FRONTEND_URL}"

echo "🚀 Redeploying backend with updated CORS..."
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Your URLs:"
echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  ${BACKEND_URL}"
echo ""
echo "✅ Test your application:"
echo "1. Visit: ${FRONTEND_URL}"
echo "2. Try signing in"
echo "3. Check that camera and AI features work"
echo ""
echo "🐛 If you encounter issues:"
echo "1. Check browser console for errors"
echo "2. Verify environment variables in Vercel dashboard"
echo "3. Test backend health: ${BACKEND_URL}/api/health"
echo ""
echo "📖 For detailed troubleshooting, see DEPLOYMENT_GUIDE.md"
