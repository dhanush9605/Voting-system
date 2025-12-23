import express from 'express';
import { registerUser, loginUser, getUserProfile, refreshToken, logoutUser, updatePassword, verifyFace } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
// Notification Routes
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController';
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

export default router;
