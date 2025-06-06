# 🚀 Backend Alternative Deployment Guide

## 🎯 Problem: Vercel Backend Requires Authentication

The backend deployed to Vercel is requiring authentication, which is blocking API access. This is a Vercel project configuration issue.

## ✅ Solution: Deploy Backend to Railway (Free Alternative)

### **Option 1: Railway Deployment (Recommended)**

1. **Go to Railway.app:**
   ```
   https://railway.app
   ```

2. **Sign up/Login** with GitHub

3. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository
   - Choose the `server` folder as root directory

4. **Set Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
   FRONTEND_URL=https://easy-calorie-guide-main-gro6lb2an-eshani-pauls-projects.vercel.app
   PORT=3001
   ```

5. **Deploy** - Railway will automatically deploy your backend

6. **Get Railway URL** (e.g., `https://your-app.railway.app`)

7. **Update Frontend Environment:**
   ```env
   VITE_API_URL=https://your-app.railway.app/api
   ```

### **Option 2: Render Deployment (Alternative)**

1. **Go to Render.com:**
   ```
   https://render.com
   ```

2. **Create Web Service:**
   - Connect GitHub repo
   - Set root directory to `server`
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Set Environment Variables** (same as above)

4. **Deploy and get URL**

### **Option 3: Quick Fix - Use Mock Backend**

For immediate testing, you can use a mock backend:

1. **Update `.env.local`:**
   ```env
   # Temporary mock API for testing
   VITE_API_URL=https://jsonplaceholder.typicode.com
   ```

2. **Redeploy frontend:**
   ```bash
   npm run build
   vercel --prod
   ```

**Note:** This will make the app load, but authentication and data features won't work properly.

## 🔧 Current Status

### **Frontend (Working):**
```
https://easy-calorie-guide-main-gro6lb2an-eshani-pauls-projects.vercel.app
```

### **Backend (Authentication Issue):**
```
https://easy-calorie-guide-main-eb42ftl56-eshani-pauls-projects.vercel.app
```

## 🎯 Recommended Next Steps

1. **Deploy backend to Railway** (easiest solution)
2. **Update frontend API URL** with Railway backend URL
3. **Redeploy frontend** with updated API URL
4. **Test the application** - 404 errors should be resolved

## 📞 Alternative Solutions

If you prefer to stick with Vercel:

1. **Check Vercel project settings** for authentication requirements
2. **Create a new Vercel project** specifically for the backend
3. **Use Vercel Functions** instead of a full server deployment

The Railway option is recommended as it's free, reliable, and doesn't have authentication restrictions for API endpoints.
