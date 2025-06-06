# 🚀 Complete Deployment Guide

## 🎯 Problem: 404 NOT_FOUND Error After Deployment

**Root Cause:** Your frontend is deployed but trying to connect to `http://localhost:3001/api` which doesn't exist in production.

**Solution:** Deploy both frontend AND backend, then update the API URLs.

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy Backend to Vercel**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Navigate to server directory:**
```bash
cd server
```

3. **Deploy backend:**
```bash
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Your account**
   - Link to existing project? **N**
   - Project name? **calorie-tracker-backend** (or your choice)
   - Directory? **./server** (current directory)

5. **Set environment variables in Vercel:**
```bash
# Set MongoDB URI
vercel env add MONGODB_URI
# Enter: mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker

# Set Frontend URL (you'll update this after deploying frontend)
vercel env add FRONTEND_URL
# Enter: https://your-frontend-domain.vercel.app
```

6. **Deploy to production:**
```bash
vercel --prod
```

7. **Note your backend URL:** `https://your-backend-domain.vercel.app`

### **Step 2: Deploy Frontend to Vercel**

1. **Navigate back to root directory:**
```bash
cd ..
```

2. **Update environment variables:**
   - Copy `.env.production` to `.env.local`
   - Update `VITE_API_URL` with your backend URL:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   ```

3. **Build the frontend:**
```bash
npm run build
```

4. **Deploy frontend:**
```bash
vercel
```

5. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Your account**
   - Link to existing project? **N**
   - Project name? **calorie-tracker-frontend** (or your choice)
   - Directory? **./** (current directory)

6. **Set environment variables in Vercel dashboard:**
   - Go to your Vercel dashboard
   - Select your frontend project
   - Go to Settings → Environment Variables
   - Add all variables from `.env.production`

7. **Deploy to production:**
```bash
vercel --prod
```

8. **Note your frontend URL:** `https://your-frontend-domain.vercel.app`

### **Step 3: Update Backend CORS Settings**

1. **Update backend environment variables:**
```bash
cd server
vercel env add FRONTEND_URL
# Enter your actual frontend URL: https://your-frontend-domain.vercel.app
```

2. **Redeploy backend:**
```bash
vercel --prod
```

---

## 🔧 Alternative: Quick Fix (Temporary)

If you want to test quickly, you can use a public backend service:

1. **Update `.env.local`:**
```env
# Use a temporary public API (for testing only)
VITE_API_URL=https://jsonplaceholder.typicode.com
```

2. **Or deploy backend to Railway/Render:**
   - Railway: https://railway.app
   - Render: https://render.com
   - Both offer free tiers for Node.js apps

---

## 📱 Environment Variables Summary

### **Frontend (.env.local):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ
VITE_MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
VITE_GEMINI_API_KEY=AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

### **Backend (Vercel Environment Variables):**
```env
MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=3001
```

---

## ✅ Verification Steps

### **1. Test Backend:**
```bash
# Visit your backend URL
https://your-backend-domain.vercel.app/api/health

# Should return:
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "..."
}
```

### **2. Test Frontend:**
```bash
# Visit your frontend URL
https://your-frontend-domain.vercel.app

# Should load without 404 errors
# Check browser console for any API errors
```

### **3. Test Sign-in:**
```bash
# Try to sign in
# Should work without 404 NOT_FOUND errors
```

---

## 🐛 Troubleshooting

### **Still getting 404 errors?**

1. **Check environment variables:**
```bash
# In Vercel dashboard, verify all env vars are set correctly
```

2. **Check CORS settings:**
```bash
# Make sure FRONTEND_URL matches your actual frontend domain
```

3. **Check API URL:**
```bash
# In browser console, check what URL the frontend is calling
# Should be: https://your-backend-domain.vercel.app/api/...
```

4. **Check backend logs:**
```bash
# In Vercel dashboard, check Function Logs for errors
```

---

## 🎯 Quick Commands Summary

```bash
# Deploy backend
cd server
vercel --prod

# Deploy frontend  
cd ..
npm run build
vercel --prod

# Update environment variables
vercel env add VARIABLE_NAME
```

---

## 📞 Need Help?

If you're still getting 404 errors after following these steps:

1. **Share your deployed URLs** (frontend and backend)
2. **Check browser console** for exact error messages
3. **Verify environment variables** in Vercel dashboard
4. **Test backend health endpoint** directly

The 404 error will be resolved once both frontend and backend are properly deployed and connected! 🚀
