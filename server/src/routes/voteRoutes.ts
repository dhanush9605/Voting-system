import express from 'express';
import { castVote, verifyVoteTransaction } from '../controllers/voteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, castVote);
router.get('/verify/:hash', verifyVoteTransaction);

export default router;
