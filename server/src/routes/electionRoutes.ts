import express from 'express';
import { getElectionConfig, getPublicElectionResults } from '../controllers/electionController.js';

const router = express.Router();

router.get('/', getElectionConfig);
router.get('/results', getPublicElectionResults);

export default router;
