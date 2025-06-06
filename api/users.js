const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker';
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

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

  try {
    const client = await connectToDatabase();
    const db = client.db('calorie-tracker');
    const collection = db.collection('users');

    if (req.method === 'POST') {
      // Create or update user
      const userData = req.body;
      
      if (!userData.clerkId) {
        return res.status(400).json({ error: 'clerkId is required' });
      }

      const result = await collection.findOneAndUpdate(
        { clerkId: userData.clerkId },
        { 
          $set: {
            ...userData,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );

      res.status(200).json(result.value);

    } else if (req.method === 'GET') {
      // Get user by clerkId from URL path
      const { query } = req;
      const clerkId = query.clerkId || req.url.split('/').pop();

      if (!clerkId) {
        return res.status(400).json({ error: 'clerkId is required' });
      }

      const user = await collection.findOne({ clerkId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}
