import mongoose from 'mongoose';
import 'dotenv/config';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...', {
      uri: MONGODB_URI.split('@')[0] + '@[HIDDEN]' // Hide credentials in logs
    });
    
    await mongoose.connect(MONGODB_URI, {
      // MongoDB Atlas recommended options
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    // Log connection details (safely)
    const { host, port, name } = mongoose.connection;
    console.log('MongoDB Atlas connected successfully:', {
      host: host || 'unknown',
      port: port || 'default',
      database: name || 'unknown',
      readyState: mongoose.connection.readyState
    });
    
    // Create indexes for better performance
    console.log('Creating database indexes...');
    try {
      await Promise.all([
        mongoose.model('User').createIndexes(),
        mongoose.model('Credit').createIndexes()
      ]);
      console.log('Database indexes created successfully');
    } catch (indexError) {
      console.error('Error creating indexes:', indexError);
      // Don't throw here, as missing indexes won't prevent basic functionality
    }
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    process.exit(1);
  }
};

export const db = mongoose.connection;

// Log database events
db.on('error', (error) => {
  console.error('MongoDB error:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

db.on('reconnected', () => {
  console.log('MongoDB reconnected');
});