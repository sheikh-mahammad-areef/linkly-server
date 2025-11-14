//  ------------------------------------------------------------------
//  file: src/config/app.config.ts
//  Application configuration
//  ------------------------------------------------------------------

import { getEnv } from '../utils/env.utils';

export const ENV = {
  PORT: getEnv('PORT', '5000'),
  // Provide a safe default so the app can start in environments without a DB URL.
  // db.config will skip connecting when this is empty.
  MONGO_URI: getEnv('MONGO_URI', ''),
  JWT_SECRET: getEnv('JWT_SECRET', 'supersecret'),
  CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:5173'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
};
