import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDb(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    });
    logger.info('Connected to MongoDB');
    return conn;
  } catch (err) {
    logger.error(err, 'MongoDB connection failed');
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}
