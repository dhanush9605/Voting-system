import express from 'express';
import { getPublicSettings } from '../controllers/adminController.js';

const router = express.Router();

// @route GET /api/settings/public
router.get('/public', getPublicSettings);

export default router;
