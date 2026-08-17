import express from 'express';
import { castVote, verifyVoteTransaction } from '../controllers/voteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, castVote);
router.get('/verify/:hash', verifyVoteTransaction);

export default router;
