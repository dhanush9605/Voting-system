import express from 'express';
import { getAllVoters, verifyVoter } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/voters', protect, admin, getAllVoters);
router.put('/verify-voter/:id', protect, admin, verifyVoter);

export default router;
