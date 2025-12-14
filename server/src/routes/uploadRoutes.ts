import express from 'express';
import { getSignedUrl } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signed-url', getSignedUrl);

export default router;
