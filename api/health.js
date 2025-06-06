const { MongoClient } = require('mongodb');

// Use the direct MongoDB URI for serverless functions
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker';

// Vercel Serverless Function for Health Check
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let databaseStatus = 'Disconnected';
  let databaseError = null;

  // Test MongoDB connection
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    // Test database access
    const db = client.db('calorie-tracker');
    await db.admin().ping();

    databaseStatus = 'Connected';
    await client.close();
  } catch (error) {
    databaseError = error.message;
    console.error('Database connection error:', error);
  }

  // Health check response
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Easy Calorie Guide API is running',
    environment: 'Vercel Serverless',
    database: databaseStatus,
    databaseError,
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      sessions: '/api/sessions',
      'food-logs': '/api/food-logs'
    },
    environmentVariables: {
      MONGODB_URI: MONGODB_URI ? 'Set' : 'Not set',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
    },
    debug: {
      mongodbUri: MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'undefined',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }
  });
}
