//  ------------------------------------------------------------------
//  file: src/index.ts
//  Main application entry point
//  ------------------------------------------------------------------

import app from './app';
import { ENV } from './config/app.config';
import { connectDB } from './config/db.config';

connectDB()
  .then(() => {
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
    });
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('❌ Failed to connect to database:', err.message);
    } else {
      console.error('❌ Failed to connect to database:', err);
    }
    process.exit(1);
  });
