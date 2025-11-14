//  ------------------------------------------------------------------
//  file: src/utils/env.utils.ts
//  Environment variable utilities
//  ------------------------------------------------------------------

// import dotenv from 'dotenv';
// dotenv.config();

export const getEnv = (key: string, defaultValue = '') => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) return defaultValue;
    throw new Error(`Environment variable ${key} value not set ! `);
  }
  return value;
};
