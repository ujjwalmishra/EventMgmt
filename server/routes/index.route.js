import express from 'express';
import adminRoutes from './admin.route';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import merchantRoutes from './merchant.route';
import ticketRoutes from './ticket.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount admin routes at /admin
router.use('/admin', adminRoutes);

// mount merchant routes at /merchant
router.use('/merchant', merchantRoutes);

// mount tickets routes at /ticket
router.use('/ticket', ticketRoutes);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
