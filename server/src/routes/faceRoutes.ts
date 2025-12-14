import express from 'express';
import { compareFace, registerFaceEmbedding } from '../controllers/faceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/compare', protect, compareFace);
router.post('/register-embedding', protect, registerFaceEmbedding);

export default router;
