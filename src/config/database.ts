// Client-side database simulation using localStorage
// Note: In production, this should be replaced with proper API calls to a backend

interface ConnectionState {
  isConnected: boolean;
}

const connection: ConnectionState = {
  isConnected: false,
};

// Simulate database connection for client-side
export const connectToDatabase = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log('✅ Already connected to local storage database');
    return;
  }

  try {
    console.log('🔄 Initializing local storage database...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initialize localStorage collections if they don't exist
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('userSessions')) {
      localStorage.setItem('userSessions', JSON.stringify([]));
    }
    if (!localStorage.getItem('foodLogs')) {
      localStorage.setItem('foodLogs', JSON.stringify([]));
    }

    connection.isConnected = true;
    console.log('✅ Successfully connected to local storage database');
    console.log('⚠️ Note: Using localStorage for demo. In production, use a proper backend API.');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!connection.isConnected) {
    return;
  }

  try {
    connection.isConnected = false;
    console.log('✅ Disconnected from local storage database');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
    throw error;
  }
};

// Utility functions for localStorage operations
export const getCollection = (collectionName: string): any[] => {
  try {
    const data = localStorage.getItem(collectionName);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
};

export const saveCollection = (collectionName: string, data: any[]): void => {
  try {
    localStorage.setItem(collectionName, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving collection ${collectionName}:`, error);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  connectToDatabase,
  disconnectFromDatabase,
  getCollection,
  saveCollection,
  generateId
};
