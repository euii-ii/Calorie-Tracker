# 🍎 Easy Calorie Guide

A comprehensive AI-powered calorie tracking and nutrition analysis application that helps users monitor their daily food intake, get personalized health recommendations, and achieve their fitness goals through intelligent food recognition and analysis.

## 🌟 Live Application

**🌐 Frontend:** [https://easy-calorie-guide-main.vercel.app](https://*************.vercel.app)
**🚂 Backend API:** [https://calorie-tracker-production-77e5.up.railway.app](https://*****-*******-*****-77e5.up.railway.app)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & User Management
- **Clerk Authentication**: Secure sign-in/sign-up with OAuth support
- **Custom Onboarding Flow**: Comprehensive user profile setup
- **Session Management**: Real-time session tracking and analytics
- **Profile Customization**: Personalized health goals and preferences

### 📱 Mobile-First Design
- **Responsive Interface**: Optimized for all device sizes
- **Mobile Camera Integration**: Native camera access for food photography
- **Touch-Friendly UI**: Intuitive mobile interactions
- **Progressive Web App**: App-like experience on mobile devices

### 🤖 AI-Powered Food Analysis
- **Gemini AI Integration**: Advanced food recognition and analysis
- **Image Processing**: Automatic nutrition extraction from food photos
- **Confidence Scoring**: AI confidence levels for analysis accuracy
- **Fallback Systems**: Multiple analysis methods for reliability

### 📊 Comprehensive Dashboard
- **Real-time Analytics**: Live nutrition tracking and progress monitoring
- **Interactive Charts**: Doughnut charts with dynamic data visualization
- **Daily Summaries**: Calorie and macronutrient breakdowns
- **Progress Tracking**: Goal achievement monitoring

### 🍽️ Smart Nutrition Tracking
- **Automatic Logging**: AI-powered food entry from photos
- **Macro Tracking**: Detailed protein, carbs, and fat monitoring
- **Meal Categorization**: Breakfast, lunch, dinner, and snack tracking
- **Nutrition Insights**: Personalized dietary recommendations

### 💡 Intelligent Recommendations
- **Personalized Tips**: AI-generated health and nutrition advice
- **Goal-Based Suggestions**: Recommendations based on user objectives
- **Progress Feedback**: Motivational messages and guidance
- **Food Suggestions**: What to eat and what to avoid recommendations

## 🛠️ Technology Stack

### Frontend Technologies
- **⚛️ React 18.3.1**: Modern React with hooks and functional components
- **📦 Vite 5.4.1**: Fast build tool and development server
- **🎨 TypeScript**: Type-safe development with full TypeScript support
- **💅 Tailwind CSS 3.4.11**: Utility-first CSS framework
- **🎭 Framer Motion**: Smooth animations and transitions

### UI Components & Libraries
- **🎯 Radix UI**: Accessible, unstyled UI primitives
- **📊 Recharts 2.12.7**: Responsive chart library for data visualization
- **🎨 Lucide React**: Beautiful SVG icons
- **📅 React Day Picker**: Date selection components
- **🔔 Sonner**: Toast notifications
- **📱 Vaul**: Mobile-friendly drawer components

### Backend Technologies
- **🟢 Node.js**: JavaScript runtime environment
- **⚡ Express.js**: Web application framework
- **🍃 MongoDB**: NoSQL database for data storage
- **🔗 Mongoose 8.15.1**: MongoDB object modeling
- **🔒 Helmet**: Security middleware
- **⚡ Rate Limiting**: API protection and throttling

### Authentication & Security
- **🔐 Clerk**: Complete authentication solution
- **🛡️ CORS**: Cross-origin resource sharing
- **🔒 Helmet**: Security headers and protection
- **⚡ Rate Limiting**: API abuse prevention

### AI & External Services
- **🤖 Google Gemini AI**: Advanced food recognition and analysis
- **📸 MediaDevices API**: Camera access for food photography
- **🌐 Fetch API**: HTTP client for API communications

### Development Tools
- **📝 ESLint**: Code linting and quality assurance
- **🎯 TypeScript**: Static type checking
- **📦 npm**: Package management
- **🔧 PostCSS**: CSS processing and optimization

### Deployment & Hosting
- **▲ Vercel**: Frontend hosting and serverless functions
- **🚂 Railway**: Backend API hosting
- **☁️ MongoDB Atlas**: Cloud database hosting
- **🌐 CDN**: Global content delivery network

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)      │◄──►│ (MongoDB Atlas) │
│                 │    │                  │    │                 │
│ • React + Vite  │    │ • Express.js     │    │ • User Profiles │
│ • TypeScript    │    │ • Node.js        │    │ • Food Logs     │
│ • Tailwind CSS  │    │ • Mongoose       │    │ • Sessions      │
│ • Clerk Auth    │    │ • Rate Limiting  │    │ • Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌──────────────────┐
         └──────────────►│   External APIs  │
                         │                  │
                         │ • Gemini AI      │
                         │ • Camera API     │
                         │ • Clerk Auth     │
                         └──────────────────┘
```

### Data Flow
1. **User Authentication**: Clerk handles secure sign-in/sign-up
2. **Profile Setup**: Onboarding flow collects user preferences
3. **Food Capture**: Mobile camera captures food images
4. **AI Analysis**: Gemini AI processes images for nutrition data
5. **Data Storage**: MongoDB stores user profiles and food logs
6. **Dashboard Display**: Real-time analytics and recommendations

### Component Architecture
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Radix UI)
│   ├── AuthWrapper.tsx  # Authentication wrapper
│   ├── OnboardingFlow.tsx # User setup flow
│   └── MobileCameraTest.tsx # Camera functionality
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Index.tsx        # Landing page
│   └── Results.tsx      # Analysis results
├── services/            # External service integrations
│   ├── apiService.ts    # Backend API communication
│   └── geminiService.ts # AI analysis service
├── models/              # Data models and types
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## 🚀 Installation

### Prerequisites
- **Node.js 22.x** or higher
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (for database)
- **Clerk** account (for authentication)
- **Google Cloud** account (for Gemini AI API)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/easy-calorie-guide.git
   cd easy-calorie-guide
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create `.env.local` in the root directory:
   ```env
   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_api_key

   # Gemini AI
   VITE_GEMINI_API_KEY=your_api_key

   # API Configuration
   VITE_API_URL=http://localhost:3001/api

   # MongoDB (for serverless functions)
   VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker
   ```

5. **Set up backend environment**
   Create `.env` in the `server` directory:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   ```

6. **Start the development servers**

   **Frontend (Terminal 1):**
   ```bash
   npm run dev
   ```

   **Backend (Terminal 2):**
   ```bash
   cd server
   npm run dev
   ```

7. **Access the application**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3001/api`

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

### Frontend Environment Variables (.env.local)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication public key | ✅ | `pk_test_...` |
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key | ✅ | `AIzaSy...` |
| `VITE_API_URL` | Backend API base URL | ✅ | `/api` or `http://localhost:3001/api` |
| `VITE_MONGODB_URI` | MongoDB connection string | ✅ | `mongodb+srv://...` |

### Backend Environment Variables (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb+srv://...` |
| `PORT` | Server port number | ✅ | `3001` |
| `NODE_ENV` | Environment mode | ✅ | `development` or `production` |
| `FRONTEND_URL` | Frontend application URL | ✅ | `http://localhost:8080` |

### Production Environment Variables

For production deployment, ensure all environment variables are set in:
- **Vercel**: Project Settings → Environment Variables
- **Railway**: Project Settings → Variables
- **MongoDB Atlas**: Database connection strings

## 📱 Usage

### Getting Started

1. **Visit the Application**
   Navigate to [https://easy-calorie-guide-main.vercel.app](https://easy-calorie-guide-main.vercel.app)

2. **Create an Account**
   - Click "Get Started"
   - Sign up with email or OAuth providers (Google, GitHub, etc.)
   - Complete the onboarding flow with your health information

3. **Set Up Your Profile**
   - Enter your height, weight, and birthdate
   - Select your fitness goals (lose weight, gain muscle, maintain)
   - Choose your workout frequency
   - Set your gender and preferences

### Core Features

#### 📸 Food Logging with Camera
1. **Access Camera**: Tap the camera button on the dashboard
2. **Capture Food**: Take a photo of your meal
3. **AI Analysis**: Wait for Gemini AI to analyze the food
4. **Review Results**: Check nutrition information and suggestions
5. **Save Log**: Confirm to add to your daily tracking

#### 📊 Dashboard Analytics
- **Daily Progress**: View calorie and macro progress rings
- **Nutrition Breakdown**: See detailed protein, carbs, and fat tracking
- **AI Recommendations**: Get personalized health advice
- **Recent Logs**: Review your food history
- **Goal Tracking**: Monitor progress toward your fitness objectives

#### 🤖 AI Health Assistant
- **Profile Analysis**: Get comprehensive health assessments
- **Food Recommendations**: Receive suggestions on what to eat
- **Progress Feedback**: Get motivational messages and guidance
- **Custom Plans**: Access personalized meal and exercise recommendations

### Mobile Usage

#### Camera Permissions
1. **Enable Camera**: Allow camera access when prompted
2. **HTTPS Required**: Ensure you're using HTTPS for camera functionality
3. **Photo Quality**: Take clear, well-lit photos for better AI analysis
4. **Multiple Angles**: Capture food from different angles if needed

#### Touch Interactions
- **Swipe Navigation**: Navigate between dashboard sections
- **Tap Charts**: Interact with nutrition charts for details
- **Pull to Refresh**: Update data by pulling down on lists
- **Long Press**: Access additional options on food logs

## 📚 API Documentation

### Base URLs
- **Production**: `https://*******************p.railway.app/api`
- **Development**: `http://localhost:3001/api`

### Authentication
All API endpoints require proper authentication through Clerk. Include the user's Clerk ID in requests.

### Core Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected"
}
```

#### User Management

**Create or Update User**
```http
POST /users
Content-Type: application/json

{
  "clerkId": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileData": {
    "height": "175",
    "weight": "70",
    "goal": "lose weight",
    "workoutFrequency": "3-5 days per week"
  }
}
```

**Get User by Clerk ID**
```http
GET /users/{clerkId}
```

#### Session Management

**Create Session**
```http
POST /sessions
Content-Type: application/json

{
  "clerkId": "user_123",
  "sessionType": "login",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "web"
  }
}
```

**Get User Sessions**
```http
GET /sessions?clerkId={clerkId}&limit=10&offset=0
```

**End Session**
```http
PUT /sessions/{sessionId}/end
```

#### Food Logging

**Create Food Log**
```http
POST /food-logs
Content-Type: application/json

{
  "userId": "user_123",
  "description": "Grilled chicken breast with vegetables",
  "healthSuggestion": "Great protein choice! Consider adding complex carbs.",
  "nutrition": {
    "calories": 350,
    "protein": 45,
    "carbs": 15,
    "fats": 8
  },
  "aiAnalysis": {
    "isFood": true,
    "confidence": "high",
    "detectedItems": ["chicken", "broccoli", "carrots"]
  }
}
```

**Get Food Logs**
```http
GET /food-logs/{userId}?date=2024-01-15&startDate=2024-01-01&endDate=2024-01-31
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information included in response headers
- **Exceeded**: Returns `429 Too Many Requests` when limit exceeded

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings for Vite

2. **Environment Variables**
   Set in Vercel Dashboard → Project → Settings → Environment Variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=/api
   VITE_MONGODB_URI=your_mongodb_connection_string
   ```

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

4. **Deploy**
   ```bash
   # Automatic deployment on git push
   git push origin main
   ```

### Backend Deployment (Railway)

1. **Create Railway Project**
   - Connect your GitHub repository
   - Select the `server` directory as root

2. **Environment Variables**
   Set in Railway Dashboard → Project → Variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker
   FRONTEND_URL=https://your-app.vercel.app
   PORT=3001
   NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   # Automatic deployment on git push
   git push origin main
   ```

### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Sign up for MongoDB Atlas
   - Create a new cluster
   - Configure network access and database users

2. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker
   ```

3. **Collections**
   The application will automatically create these collections:
   - `users` - User profiles and settings
   - `sessions` - Authentication sessions
   - `foodlogs` - Food logging data

### Custom Domain Setup

1. **Vercel Custom Domain**
   - Add domain in Vercel Dashboard
   - Configure DNS records
   - Enable HTTPS

2. **Railway Custom Domain**
   - Add domain in Railway Dashboard
   - Configure CNAME record
   - Update CORS settings

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing

The project includes several HTML test files for manual testing:

1. **AI Integration Test**
   ```bash
   open test-ai-integration.html
   ```
   - Tests Gemini AI integration
   - Profile analysis functionality
   - Food analysis capabilities

2. **Mobile Camera Test**
   ```bash
   open mobile-camera-test.html
   ```
   - Camera access and permissions
   - Photo capture functionality
   - Mobile device compatibility

3. **Authentication Flow Test**
   ```bash
   open test-auth-flow.html
   ```
   - Clerk authentication
   - Sign-in/sign-up flows
   - OAuth integrations

4. **Database API Test**
   ```bash
   open test-mongodb-api.html
   ```
   - API endpoint testing
   - Database connectivity
   - CRUD operations

### Testing Checklist

#### ✅ Frontend Testing
- [ ] Authentication flow works
- [ ] Onboarding process completes
- [ ] Dashboard loads with data
- [ ] Camera functionality works on mobile
- [ ] Charts and analytics display correctly
- [ ] Responsive design on all devices

#### ✅ Backend Testing
- [ ] All API endpoints respond correctly
- [ ] Database connections are stable
- [ ] Rate limiting functions properly
- [ ] Error handling works as expected
- [ ] CORS configuration allows frontend access

#### ✅ Integration Testing
- [ ] Gemini AI analysis returns valid results
- [ ] Food logs save to database
- [ ] User sessions track properly
- [ ] Real-time updates work
- [ ] Mobile camera integrates with AI analysis

## 🤝 Contributing

We welcome contributions to the Easy Calorie Guide project! Here's how you can help:

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/easy-calorie-guide.git
   cd easy-calorie-guide
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Submit a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style Guidelines

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### React Components
- Use functional components with hooks
- Implement proper prop types
- Follow component composition patterns
- Use custom hooks for reusable logic

#### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use CSS variables for theme values

### Reporting Issues

When reporting bugs or requesting features:

1. **Check Existing Issues**: Search for similar issues first
2. **Provide Details**: Include steps to reproduce, expected behavior, and actual behavior
3. **Include Environment**: Specify browser, device, and version information
4. **Add Screenshots**: Visual aids help understand the issue

### Feature Requests

For new feature suggestions:

1. **Describe the Problem**: What problem does this solve?
2. **Propose a Solution**: How should it work?
3. **Consider Alternatives**: What other approaches could work?
4. **Assess Impact**: How would this affect existing users?

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

### Technologies & Services
- **React Team**: For the amazing React framework
- **Vercel**: For excellent hosting and deployment platform
- **Railway**: For reliable backend hosting
- **MongoDB**: For robust database solutions
- **Clerk**: For seamless authentication
- **Google**: For Gemini AI capabilities
- **Tailwind CSS**: For utility-first styling
- **Radix UI**: For accessible component primitives

### Open Source Libraries
- **Vite**: Lightning-fast build tool
- **TypeScript**: Type-safe development
- **Recharts**: Beautiful chart components
- **Lucide**: Comprehensive icon library
- **React Hook Form**: Efficient form handling
- **Mongoose**: MongoDB object modeling

### Community
- **Contributors**: Everyone who has contributed to this project
- **Beta Testers**: Users who provided valuable feedback
- **Open Source Community**: For inspiration and shared knowledge

## 📞 Support

### Getting Help

1. **Documentation**: Check this README and inline code comments
2. **Issues**: Search existing GitHub issues or create a new one
3. **Discussions**: Join GitHub Discussions for questions and ideas
4. **Email**: Contact the maintainers for urgent issues

### Useful Links

- **Live Application**: [https://easy-calorie-guide-main.vercel.app](https://easy-calorie-guide-main.vercel.app)
- **API Documentation**: [Backend API Docs](https://calorie-tracker-production-77e5.up.railway.app/api/health)
- **GitHub Repository**: [https://github.com/your-username/easy-calorie-guide](https://github.com/your-username/easy-calorie-guide)
- **Issue Tracker**: [GitHub Issues](https://github.com/your-username/easy-calorie-guide/issues)

### Status Page

Monitor the application status:
- **Frontend Status**: Vercel Status Page
- **Backend Status**: Railway Status Page
- **Database Status**: MongoDB Atlas Status

---

**Made with ❤️ by the Easy Calorie Guide Team**

*Helping people achieve their health goals through intelligent nutrition tracking and AI-powered insights.*
