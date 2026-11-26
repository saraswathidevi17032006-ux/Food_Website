import mongoose from 'mongoose';
import { enableInMemoryMode } from '../utils/store.js';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!mongoUri) {
    if (!isProduction) {
      console.warn('MONGO_URI is not set. Starting in local in-memory dev mode.');
      enableInMemoryMode();
      return null;
    }
    throw new Error('MONGO_URI environment variable is not defined.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: isProduction ? 15000 : 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (!isProduction && process.env.REQUIRE_DB !== 'true') {
      console.warn(
        `MongoDB connection unavailable (${error.message}). Falling back to local in-memory dev data.`
      );
      enableInMemoryMode();
      return null;
    }
    throw error;
  }
};

export default connectDB;
