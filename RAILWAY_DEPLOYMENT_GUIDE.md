# 🚂 Railway Backend Deployment Guide

## 🎯 Step-by-Step Railway Deployment

### **Step 1: Access Railway**
1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up/Login with GitHub

### **Step 2: Create New Project**
1. Click "Deploy from GitHub repo"
2. Connect your GitHub account if not already connected
3. Select your repository: `easy-calorie-guide-main`
4. Choose "Deploy from a folder"
5. Set folder path to: `server`

### **Step 3: Configure Environment Variables**
In Railway dashboard, go to Variables tab and add:

```
MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
FRONTEND_URL=https://easy-calorie-guide-main-2g4p1d7n3-eshani-pauls-projects.vercel.app
PORT=3001
NODE_ENV=production
```

### **Step 4: Deploy**
1. Railway will automatically detect Node.js
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete
4. Copy the Railway URL (e.g., `https://your-app.railway.app`)

### **Step 5: Test Backend**
Visit: `https://your-app.railway.app/api/health`
Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "database": "Connected"
}
```

### **Step 6: Update Frontend**
1. Update `.env.local` with Railway URL:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
2. Rebuild and redeploy frontend

## 🔧 Files Created for Railway:
- ✅ `server/railway.json` - Railway configuration
- ✅ `server/Procfile` - Process file
- ✅ `server/package.json` - Already configured correctly

## 🎯 Expected Railway URL Format:
`https://[project-name]-production.railway.app`

## 🐛 Troubleshooting:
- If deployment fails, check Railway logs
- Ensure all environment variables are set
- Verify MongoDB connection string is correct

## ✅ Success Indicators:
1. Railway shows "Deployed" status
2. Health endpoint returns 200 OK
3. Frontend can connect without 404 errors
4. Authentication works properly
