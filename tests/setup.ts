//  ------------------------------------------------------------------
//  file: tests\setup.ts
//  Global Vitest test setup (MongoDB connection, env)
//  ------------------------------------------------------------------

import mongoose from 'mongoose';
import { loadEnv } from 'vite';
import { afterAll, beforeAll } from 'vitest';

// Load test environment variables from .test.env file
const env = loadEnv('test', process.cwd(), '');

// Load test environment variables
process.env.NODE_ENV = env.NODE_ENV;
process.env.MONGO_URI = env.MONGO_URI;
process.env.JWT_ACCESS_SECRET = env.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = env.JWT_SECRET;
process.env.CLIENT_URL = env.CLIENT_URL;
process.env.PORT = env.PORT;

beforeAll(async () => {
  // Connect to test database
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined for tests');
  }
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
