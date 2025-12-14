import express from 'express';
import { getAllVoters, verifyVoter, deleteVoter, getDashboardStats, getElectionResults } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/voters', protect, admin, getAllVoters);
router.delete('/voters/:id', protect, admin, deleteVoter);
router.put('/verify-voter/:id', protect, admin, verifyVoter);
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/results', protect, admin, getElectionResults);

// Election Info Management
import { getElectionConfig, updateElectionConfig, togglePublishResults } from '../controllers/electionController';
router.get('/election', protect, admin, getElectionConfig);
router.put('/election', protect, admin, updateElectionConfig);
router.put('/election/publish', protect, admin, togglePublishResults);

export default router;
