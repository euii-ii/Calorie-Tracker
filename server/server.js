const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import models
const UserSession = require('./models/UserSession');
const UserProfile = require('./models/User');
const FoodLog = require('./models/FoodLog');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker';
console.log('🔍 MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('🔍 Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🔗 Connection Host:', mongoose.connection.host);
  console.log('🔗 Connection Port:', mongoose.connection.port);
  console.log('🔗 Connection State:', mongoose.connection.readyState);

  // List all collections
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('📋 Available Collections:', collections.map(c => c.name));
    })
    .catch(err => console.log('❌ Error listing collections:', err));
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Easy Calorie Guide API Server',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      sessions: '/api/sessions',
      foodLogs: '/api/food-logs'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const sessionCount = await UserSession.countDocuments();
    const userCount = await UserProfile.countDocuments();
    const foodLogCount = await FoodLog.countDocuments();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      collections: {
        sessions: sessionCount,
        users: userCount,
        foodLogs: foodLogCount
      },
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      error: error.message
    });
  }
});

// Debug endpoint to show actual data
app.get('/api/debug/data', async (req, res) => {
  try {
    const sessions = await UserSession.find().limit(5).sort({ signInTime: -1 });
    const users = await UserProfile.find().limit(5);

    // Get all collection names from the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    res.json({
      message: 'Data successfully stored in MongoDB!',
      connectionInfo: {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState,
        connectionString: `mongodb+srv://eshani:***@cluster0.j0hvfzi.mongodb.net/${mongoose.connection.name}`
      },
      allCollections: collections.map(c => ({
        name: c.name,
        type: c.type
      })),
      dataDetails: {
        sessions: {
          collectionName: UserSession.collection.name,
          count: await UserSession.countDocuments(),
          sample: sessions.map(s => ({
            _id: s._id,
            clerkId: s.clerkId,
            email: s.email,
            signInMethod: s.signInMethod,
            signInTime: s.signInTime,
            deviceType: s.deviceInfo?.type,
            browser: s.deviceInfo?.browser,
            ipAddress: s.ipAddress,
            isActive: s.isActive
          }))
        },
        users: {
          collectionName: UserProfile.collection.name,
          count: await UserProfile.countDocuments(),
          sample: users.map(u => ({
            _id: u._id,
            clerkId: u.clerkId,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
          }))
        }
      },
      mongodbCompassInstructions: {
        step1: "Open MongoDB Compass",
        step2: `Connect to: mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/`,
        step3: `Select database: ${mongoose.connection.name}`,
        step4: `Look for collections: ${UserSession.collection.name}, ${UserProfile.collection.name}`,
        step5: "Refresh if collections don't appear immediately"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Test endpoint to manually create a test user
app.post('/api/debug/test-user', async (req, res) => {
  try {
    const testUser = new UserProfile({
      clerkId: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      profileData: {
        height: 170,
        weight: 70,
        age: 25,
        gender: 'male',
        goal: 'maintain'
      }
    });

    const savedUser = await testUser.save();

    res.json({
      message: 'Test user created successfully!',
      user: savedUser,
      instructions: 'Check MongoDB Compass for this test user in the users collection'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Test endpoint to manually create a test session
app.post('/api/debug/test-session', async (req, res) => {
  try {
    const testSession = new UserSession({
      clerkId: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      signInMethod: 'email',
      signInTime: new Date(),
      isActive: true,
      deviceInfo: {
        type: 'desktop',
        browser: 'Test Browser',
        os: 'Test OS'
      },
      location: {
        timezone: 'UTC'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test User Agent'
    });

    const savedSession = await testSession.save();

    res.json({
      message: 'Test session created successfully!',
      session: savedSession,
      instructions: 'Check MongoDB Compass for this test session in the user_sessions collection'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// User Session Routes
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('📥 Received session data:', JSON.stringify(req.body, null, 2));

    const sessionData = req.body;

    // Add IP address from request
    sessionData.ipAddress = req.ip || req.connection.remoteAddress;

    console.log('💾 Creating session with data:', JSON.stringify(sessionData, null, 2));

    const session = new UserSession(sessionData);
    const savedSession = await session.save();

    console.log('✅ Session saved to database with ID:', savedSession._id);
    console.log('✅ New sign-in tracked:', {
      clerkId: session.clerkId,
      email: session.email,
      method: session.signInMethod,
      time: session.signInTime,
      databaseId: savedSession._id
    });

    // Verify the session was actually saved by querying it back
    const verifySession = await UserSession.findById(savedSession._id);
    console.log('🔍 Verification - Session exists in DB:', !!verifySession);

    res.status(201).json(savedSession);
  } catch (error) {
    console.error('❌ Error creating session:', error);
    console.error('❌ Error details:', error.stack);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const { clerkId, days = 30, active } = req.query;
    
    let query = {};
    
    if (clerkId) {
      query.clerkId = clerkId;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.signInTime = { $gte: startDate };
    }
    
    const sessions = await UserSession.find(query)
      .sort({ signInTime: -1 })
      .limit(100); // Limit to prevent large responses
    
    res.json(sessions);
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sessions/:id/end', async (req, res) => {
  try {
    const session = await UserSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.endSession();
    await session.save();
    
    console.log('✅ Session ended:', session.clerkId);
    res.json(session);
  } catch (error) {
    console.error('❌ Error ending session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sessions/end-by-clerk/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const activeSessions = await UserSession.find({ 
      clerkId, 
      isActive: true 
    });
    
    for (const session of activeSessions) {
      session.endSession();
      await session.save();
    }
    
    console.log('✅ All sessions ended for user:', clerkId, `(${activeSessions.length} sessions)`);
    res.json({ 
      message: 'Sessions ended successfully', 
      sessionsEnded: activeSessions.length 
    });
  } catch (error) {
    console.error('❌ Error ending sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Session Statistics
app.get('/api/sessions/stats/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const allSessions = await UserSession.find({ clerkId });
    const activeSessions = allSessions.filter(s => s.isActive);
    
    const totalSessions = allSessions.length;
    const activeCount = activeSessions.length;
    
    // Calculate average session duration (only for ended sessions)
    const endedSessions = allSessions.filter(s => !s.isActive && s.sessionDuration);
    const averageSessionDuration = endedSessions.length > 0
      ? Math.round(endedSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / endedSessions.length)
      : 0;

    // Get last sign-in
    const lastSignIn = allSessions.length > 0 
      ? allSessions.sort((a, b) => b.signInTime.getTime() - a.signInTime.getTime())[0].signInTime
      : null;

    // Count sign-in methods
    const signInMethods = {};
    allSessions.forEach(session => {
      signInMethods[session.signInMethod] = (signInMethods[session.signInMethod] || 0) + 1;
    });

    res.json({
      totalSessions,
      activeSessions: activeCount,
      averageSessionDuration,
      lastSignIn,
      signInMethods,
    });
  } catch (error) {
    console.error('❌ Error fetching session stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Profile Routes
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;

    // Validate and clean nutrition plan data
    if (userData.nutritionPlan) {
      const nutrition = userData.nutritionPlan;

      // Remove invalid nutrition data
      if (nutrition.calories && (nutrition.calories < 800 || nutrition.calories > 5000)) {
        console.log('⚠️ Invalid calories detected, removing:', nutrition.calories);
        delete userData.nutritionPlan.calories;
      }

      if (nutrition.carbs && (nutrition.carbs < 50 || nutrition.carbs > 800)) {
        console.log('⚠️ Invalid carbs detected, removing:', nutrition.carbs);
        delete userData.nutritionPlan.carbs;
      }

      if (nutrition.protein && (nutrition.protein < 20 || nutrition.protein > 300)) {
        console.log('⚠️ Invalid protein detected, removing:', nutrition.protein);
        delete userData.nutritionPlan.protein;
      }

      if (nutrition.fats && (nutrition.fats < 20 || nutrition.fats > 200)) {
        console.log('⚠️ Invalid fats detected, removing:', nutrition.fats);
        delete userData.nutritionPlan.fats;
      }

      // If all nutrition values are invalid, remove the entire nutrition plan
      if (!nutrition.calories && !nutrition.carbs && !nutrition.protein && !nutrition.fats) {
        console.log('⚠️ All nutrition values invalid, removing nutrition plan');
        delete userData.nutritionPlan;
      }
    }

    // Check if user already exists
    let user = await UserProfile.findOne({ clerkId: userData.clerkId });

    if (user) {
      // Update existing user - only update fields that are provided
      const updateData = { ...userData };

      // Handle email uniqueness - don't update email if it's the same
      if (updateData.email === user.email) {
        delete updateData.email;
      }

      // Merge the data carefully
      Object.keys(updateData).forEach(key => {
        if (key === 'profileData' && user.profileData) {
          user.profileData = { ...user.profileData.toObject(), ...updateData.profileData };
        } else if (key === 'nutritionPlan' && user.nutritionPlan) {
          user.nutritionPlan = { ...user.nutritionPlan.toObject(), ...updateData.nutritionPlan };
        } else {
          user[key] = updateData[key];
        }
      });

      await user.save();
      console.log('✅ User profile updated:', userData.clerkId);
    } else {
      // Create new user
      user = new UserProfile(userData);
      await user.save();
      console.log('✅ New user profile created:', userData.clerkId);
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Error creating/updating user:', error);

    // If it's a duplicate key error, try to find and return the existing user
    if (error.code === 11000) {
      try {
        const existingUser = await UserProfile.findOne({
          $or: [
            { clerkId: req.body.clerkId },
            { email: req.body.email }
          ]
        });

        if (existingUser) {
          console.log('✅ Returning existing user due to duplicate key');
          return res.json(existingUser);
        }
      } catch (findError) {
        console.error('❌ Error finding existing user:', findError);
      }
    }

    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const user = await UserProfile.findOne({ clerkId: req.params.clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Food Log Routes
app.post('/api/food-logs', async (req, res) => {
  try {
    const foodLog = new FoodLog(req.body);
    await foodLog.save();
    
    console.log('✅ Food log created:', foodLog._id);
    res.status(201).json(foodLog);
  } catch (error) {
    console.error('❌ Error creating food log:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/food-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, startDate, endDate } = req.query;
    
    let query = { userId };
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.logDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.logDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const logs = await FoodLog.find(query).sort({ logDate: -1, createdAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error('❌ Error fetching food logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});
