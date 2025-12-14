import express from 'express';
import {
    createCandidate,
    getAllCandidates,
    updateCandidate,
    deleteCandidate
} from '../controllers/candidateController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getAllCandidates) // Voters need to be logged in to see candidates? Yes.
    .post(protect, admin, createCandidate);

router.route('/:id')
    .put(protect, admin, updateCandidate)
    .delete(protect, admin, deleteCandidate);

export default router;
