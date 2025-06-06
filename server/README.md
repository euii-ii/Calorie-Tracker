# Easy Calorie Guide - Backend API

## 🚀 Railway Deployment

This backend is designed to be deployed on Railway.app

### Environment Variables Required:
```
MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
FRONTEND_URL=https://easy-calorie-guide-main-2g4p1d7n3-eshani-pauls-projects.vercel.app
PORT=3001
NODE_ENV=production
```

### API Endpoints:
- `GET /api/health` - Health check
- `POST /api/users` - Create/update user
- `GET /api/users/:clerkId` - Get user by Clerk ID
- `POST /api/sessions` - Create user session
- `GET /api/sessions` - Get user sessions
- `POST /api/food-logs` - Create food log
- `GET /api/food-logs/:userId` - Get user food logs

### Local Development:
```bash
npm install
npm run dev
```

### Production:
```bash
npm start
```
