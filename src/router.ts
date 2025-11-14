//  ------------------------------------------------------------------
//  file: src/router.ts
//  Main API router setup
//  ------------------------------------------------------------------

import { Router } from 'express';

import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmark.routes';

const router = Router();

router.get('/', (_, res) => {
  res.send('🚀 Linkly API is running!');
});

router.use('/auth', authRoutes);
router.use('/bookmarks', bookmarkRoutes);

export default router;
