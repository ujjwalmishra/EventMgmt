import express from 'express';
import adminRoutes from './admin.route';
import userRoutes from './user.route';
import authRoutes from './auth.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount admin routes at /admin
router.use('/admin', adminRoutes);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
