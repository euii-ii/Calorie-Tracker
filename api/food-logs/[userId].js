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
    const collection = db.collection('foodlogs');

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (req.method === 'GET') {
      // Get food logs for a user
      const { date, startDate, endDate } = req.query;
      
      let filter = { userId };
      
      if (date) {
        // Filter by specific date
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        filter.createdAt = {
          $gte: targetDate,
          $lt: nextDay
        };
      } else if (startDate && endDate) {
        // Filter by date range
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      } else if (startDate) {
        // Filter from start date onwards
        filter.createdAt = { $gte: new Date(startDate) };
      } else if (endDate) {
        // Filter up to end date
        filter.createdAt = { $lte: new Date(endDate) };
      }

      const foodLogs = await collection.find(filter)
        .sort({ createdAt: -1 })
        .toArray();
      
      res.status(200).json(foodLogs);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}
