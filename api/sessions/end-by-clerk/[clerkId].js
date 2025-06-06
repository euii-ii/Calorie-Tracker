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

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('calorie-tracker');
    const collection = db.collection('sessions');

    const { clerkId } = req.query;

    if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
    }

    // End all sessions for a clerk user
    const result = await collection.updateMany(
      { clerkId, isActive: true },
      { 
        $set: { 
          isActive: false, 
          endedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    res.status(200).json({ 
      message: `Ended ${result.modifiedCount} sessions`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}
