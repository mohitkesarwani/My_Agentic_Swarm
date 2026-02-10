import mongoose from 'mongoose';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');

    // Build and start the app
    const app = await buildApp();
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    logger.info(`API server listening on ${env.API_HOST}:${env.API_PORT}`);

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      await app.close();
      await mongoose.disconnect();
      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
