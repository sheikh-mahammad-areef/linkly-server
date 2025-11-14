//  ------------------------------------------------------------------
//  file: src/config/db.config.ts
//  Database configuration and connection
//  ------------------------------------------------------------------

import mongoose from 'mongoose';

import { ENV } from './app.config';

export const connectDB = async () => {
  try {
    if (!ENV.MONGO_URI) {
      console.warn('⚠️  MONGO_URI not set — skipping MongoDB connection (running without DB)');
      return;
    }

    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed', error);
    process.exit(1);
  }
};
