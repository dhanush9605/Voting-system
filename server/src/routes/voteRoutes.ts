import express from 'express';
import { castVote } from '../controllers/voteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, castVote);

export default router;
