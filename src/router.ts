import { Router } from 'express';
import authRoutes from './routes/auth.routes';
// import bookmarkRoutes from "./bookmark.routes";

const router = Router();

router.get('/', (_, res) => {
  res.send('🚀 Linkly API is running!');
});

router.use('/auth', authRoutes);
// router.use("/bookmarks", bookmarkRoutes);

export default router;
