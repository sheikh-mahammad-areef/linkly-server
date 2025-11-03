import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/app.config';
import { errorHandler } from './middlewares/error.middleware';
import routes from './router';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;
