import express from 'express';
import { compareFace, registerFaceEmbedding } from '../controllers/faceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/compare', protect, compareFace);
router.post('/register-embedding', protect, registerFaceEmbedding);

export default router;
