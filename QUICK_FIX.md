# 🚀 Quick Fix for 404 NOT_FOUND Error

## 🎯 Immediate Solution

The 404 error happens because your deployed frontend is trying to connect to `http://localhost:3001/api` which doesn't exist in production.

### **Option 1: Deploy Backend (Recommended)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy backend:**
```bash
cd server
vercel --prod
```

3. **Note the backend URL** (e.g., `https://your-backend-abc123.vercel.app`)

4. **Update frontend environment:**
```bash
cd ..
# Edit .env.local and change:
VITE_API_URL=https://your-backend-abc123.vercel.app/api
```

5. **Redeploy frontend:**
```bash
npm run build
vercel --prod
```

### **Option 2: Use Mock API (Testing Only)**

If you just want to test the frontend quickly:

1. **Update `.env.local`:**
```env
# Temporary mock API for testing
VITE_API_URL=https://jsonplaceholder.typicode.com
```

2. **Redeploy:**
```bash
npm run build
vercel --prod
```

**Note:** This will make the app load, but sign-in and data features won't work.

### **Option 3: Use Public Backend Service**

Deploy your backend to a free service:

1. **Railway.app:**
   - Go to https://railway.app
   - Connect your GitHub repo
   - Deploy the `server` folder
   - Get the URL and update `VITE_API_URL`

2. **Render.com:**
   - Go to https://render.com
   - Create a new Web Service
   - Connect your repo, set root directory to `server`
   - Deploy and get the URL

## 🔧 Environment Variables Needed

### **Backend (Vercel/Railway/Render):**
```env
MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=3001
```

### **Frontend (Vercel):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aHVtYW5lLWhlbi0zLmNsZXJrLmFjY291bnRzLmRldiQ
VITE_MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
VITE_GEMINI_API_KEY=AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

## ✅ Quick Test

After updating the API URL:

1. **Visit your frontend URL**
2. **Open browser console** (F12)
3. **Try to sign in**
4. **Check for 404 errors** - should be gone!

## 🎯 Root Cause Explained

```
❌ Problem:
Frontend (deployed) → http://localhost:3001/api (doesn't exist)

✅ Solution:
Frontend (deployed) → https://backend-domain.vercel.app/api (exists)
```

The fix is simply updating the API URL to point to your deployed backend instead of localhost!
