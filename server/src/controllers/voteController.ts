import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { VerificationStatus } from '../models/User';
import Candidate from '../models/Candidate';
import Election from '../models/Election';
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

        // 2. Fetch Candidate or Check Abstain
        if (candidateId === 'abstain') {
            await Election.findOneAndUpdate({}, { $inc: { abstainCount: 1 } }, { session });
        } else {
            const candidate = await Candidate.findById(candidateId).session(session);
            if (!candidate) {
                await session.abortTransaction();
                session.endSession();
                res.status(404).json({ message: 'Candidate not found' });
                return;
            }

            // 3. Record Vote (Atomic operations)
            // Increment candidate vote count atomically to prevent race conditions
            await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } }, { session });
        }

        // Mark user as having voted
        user.hasVoted = true;
        await user.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // --- BLOCKCHAIN INTEGRATION ---
        // We do this AFTER the DB transaction ensures the user is valid and hasn't voted.
        let transactionHash: string | undefined;

        if (candidateId !== 'abstain') {
            try {
                const { contract } = await import('../config/blockchain');
                
                if (!contract) {
                     throw new Error("Blockchain not configured");
                }

                console.log(`🔗 Submitting vote for ${candidateId} to blockchain...`);
                // Call the smart contract
                const tx = await contract.vote(candidateId);
                transactionHash = tx.hash;
                console.log(`✅ Vote submitted! Tx Hash: ${tx.hash}`);

            } catch (bcError: any) {
                console.error("⚠️ Blockchain sync failed:", bcError);
                
                // --- ROLLBACK MONGODB ---
                console.log("🔄 Rolling back MongoDB changes...");
                
                // 1. Revert user status
                user.hasVoted = false;
                await user.save();

                // 2. Decrement candidate vote count
                await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: -1 } });
                
                return res.status(500).json({ 
                    message: 'Blockchain transaction failed. Please try again.',
                    error: bcError.message 
                });
            }
        } else {
            // Check if we need to sync abstain to blockchain (smart contract doesn't seem to have abstain?)
            // If smart contract relies on vote count, abstaining might not be recorded there?
            // Assuming abstain is local-only or handled differently. 
            // If user wanted abstain to be on blockchain, we'd need a contract function for it.
            // For now, we only rollback if it was a real candidate vote that failed.
        }

        // Persist the transaction hash to the user record
        if (transactionHash) {
            user.voteTransactionHash = transactionHash;
            await user.save();
        }

        res.status(200).json({ message: 'Vote cast successfully', transactionHash });

    } catch (error: any) {
        // If session is still active/in-transaction, abort it.
        // If we already committed (line 72), this catch block catches errors from the post-commit phase 
        // (like the blockchain logic above, BUT we handled that with its own try/catch).
        // So this main catch is for the initial DB logic.
        
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Vote Error:', error);
        if (!res.headersSent) {
             res.status(500).json({ message: 'Voting failed. Please try again.' });
        }
    }
}


// @desc    Verify vote transaction on blockchain
// @route   GET /api/vote/verify/:hash
// @access  Public
export const verifyVoteTransaction = async (req: Request, res: Response) => {
    try {
        const { hash } = req.params;
        const { wallet } = await import('../config/blockchain');

        if (!wallet || !wallet.provider) {
            res.status(503).json({ message: 'Blockchain service unavailable' });
            return;
        }

        const tx = await wallet.provider.getTransaction(hash);

        if (!tx) {
            res.status(404).json({ message: 'Transaction not found on chain' });
            return;
        }

        // Get receipt for status and block number
        const receipt = await wallet.provider.getTransactionReceipt(hash);
        let timestamp = null;

        if (receipt) {
            const block = await wallet.provider.getBlock(receipt.blockNumber);
            if (block) timestamp = new Date(Number(block.timestamp) * 1000).toISOString();
        }

        res.json({
            hash: tx.hash,
            blockNumber: tx.blockNumber,
            from: tx.from,
            to: tx.to,
            status: receipt?.status === 1 ? 'Confirmed' : 'Pending/Failed',
            timestamp
        });

    } catch (error: any) {
        console.error('Verify Transaction Error:', error);
        res.status(500).json({ message: 'Error verifying transaction' });
    }
};
