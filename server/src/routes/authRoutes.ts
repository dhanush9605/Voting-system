import express from 'express';
import { registerUser, loginUser, getUserProfile, refreshToken, logoutUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);

export default router;
