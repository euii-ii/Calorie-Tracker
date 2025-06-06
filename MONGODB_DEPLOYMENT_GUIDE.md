# 🚀 MongoDB Direct Integration Deployment Guide

## 📋 Overview

This guide configures your Easy Calorie Guide app to connect directly to MongoDB Atlas without requiring a separate backend server. The app uses Vercel Serverless Functions for API operations.

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Vercel Serverless Functions (/api/*)
    ↓
MongoDB Atlas (Direct Connection)
```

## 🔧 Configuration Summary

### **Environment Variables:**
- ✅ `VITE_CLERK_PUBLISHABLE_KEY`: Authentication
- ✅ `VITE_MONGODB_URI`: Database connection
- ✅ `VITE_GEMINI_API_KEY`: AI analysis
- ✅ `VITE_API_URL`: Set to `/api` (serverless functions)
- ✅ `MONGODB_URI`: Backend database connection

### **API Endpoints Created:**
- 🏥 `/api/health` - Health check with MongoDB status
- 👤 `/api/users` - User management (POST)
- 👤 `/api/users/[clerkId]` - Get/Update user by Clerk ID
- 📱 `/api/sessions` - Session management (GET, POST)
- 📱 `/api/sessions/[sessionId]/end` - End specific session
- 📱 `/api/sessions/end-by-clerk/[clerkId]` - End all user sessions
- 📱 `/api/sessions/stats/[clerkId]` - Get session statistics
- 🍎 `/api/food-logs` - Create food logs (POST)
- 🍎 `/api/food-logs/[userId]` - Get user food logs

## 🚀 Deployment Steps

### **Option 1: Automated Deployment**
```bash
# Run the deployment script
deploy-mongodb.bat
```

### **Option 2: Manual Deployment**

1. **Set Environment Variables in Vercel:**
   ```bash
   vercel env add VITE_CLERK_PUBLISHABLE_KEY production
   # Enter: pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ
   
   vercel env add VITE_MONGODB_URI production
   # Enter: mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
   
   vercel env add VITE_GEMINI_API_KEY production
   # Enter: AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E
   
   vercel env add VITE_API_URL production
   # Enter: /api
   
   vercel env add MONGODB_URI production
   # Enter: mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

## 🧪 Testing

### **1. Health Check:**
Visit: `https://easy-calorie-guide-main.vercel.app/api/health`

Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "Connected",
  "environment": "Vercel Serverless"
}
```

### **2. Local Testing:**
Open `test-mongodb-api.html` in your browser to test all endpoints.

### **3. App Testing:**
1. Visit: `https://easy-calorie-guide-main.vercel.app/`
2. Sign in with Clerk
3. Complete onboarding
4. Use camera feature
5. Check dashboard for data persistence

## 📊 Database Collections

The app will create these MongoDB collections:
- `users` - User profiles and settings
- `sessions` - Authentication sessions
- `foodlogs` - Food logging data

## 🔍 Troubleshooting

### **Common Issues:**

1. **Environment Variables Not Set:**
   - Check Vercel dashboard → Project → Settings → Environment Variables
   - Ensure all variables are set for "Production" environment

2. **MongoDB Connection Failed:**
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
   - Ensure database user has read/write permissions

3. **API Endpoints Not Working:**
   - Check `/api/health` endpoint first
   - Verify Vercel deployment completed successfully
   - Check Vercel function logs for errors

4. **CORS Issues:**
   - All API endpoints include proper CORS headers
   - Should work from any domain

## ✅ Success Indicators

- ✅ Health endpoint returns "Connected" database status
- ✅ User can sign in and complete onboarding
- ✅ Data persists between sessions
- ✅ Camera and AI features work
- ✅ Dashboard shows real data from MongoDB

## 🔗 Important URLs

- **App:** https://easy-calorie-guide-main.vercel.app/
- **Health Check:** https://easy-calorie-guide-main.vercel.app/api/health
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Vercel Dashboard:** https://vercel.com/dashboard

## 📝 Notes

- No separate backend server required
- All API operations use Vercel Serverless Functions
- MongoDB connection is direct from serverless functions
- Environment variables are securely managed by Vercel
- Automatic scaling and global CDN included
