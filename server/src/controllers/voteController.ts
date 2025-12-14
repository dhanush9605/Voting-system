import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { VerificationStatus } from '../models/User';
import Candidate from '../models/Candidate';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Cast a vote
// @route   POST /api/vote
// @access  Private (Voter only)
export const castVote = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { candidateId } = req.body;
        const userId = req.user?._id;

        if (!candidateId) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ message: 'Candidate ID is required' });
            return;
        }

        // 1. Fetch User and Check Eligibility
        const user = await User.findById(userId).session(session);

        if (!user) {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.verificationStatus !== VerificationStatus.VERIFIED) {
            await session.abortTransaction();
            session.endSession();
            res.status(403).json({ message: 'You must be verified to vote' });
            return;
        }

        if (user.hasVoted) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ message: 'You have already voted' });
            return;
        }

        // 2. Fetch Candidate
        const candidate = await Candidate.findById(candidateId).session(session);
        if (!candidate) {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        // 3. Record Vote (Atomic operations)
        // Increment candidate vote count
        candidate.voteCount += 1;
        await candidate.save({ session });

        // Mark user as having voted
        user.hasVoted = true;
        await user.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Vote cast successfully' });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error('Vote Error:', error);
        res.status(500).json({ message: 'Voting failed. Please try again.' });
    }
};
