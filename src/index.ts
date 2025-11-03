import app from './app';
import { connectDB } from './config/db.config';
import { ENV } from './config/app.config';

connectDB();

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
});
