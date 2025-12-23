import { Request, Response } from 'express';
import Election from '../models/Election';
import Candidate from '../models/Candidate';
import User, { UserRole } from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification from '../models/Notification';

// @desc    Get public election results
// @route   GET /api/election/results
// @access  Public
export const getPublicElectionResults = async (req: Request, res: Response) => {
    try {
        const election = await Election.findOne();

        if (!election || !election.resultsPublished) {
            return res.status(403).json({ message: 'Results not published yet' });
        }

        const candidates = await Candidate.find();

        // Calculate total votes
        const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0) + (election.abstainCount || 0);

        // Define a palette of vibrant colors
        const COLORS = [
            '#0EA5E9', // Ocean Blue
            '#F97316', // Orange
            '#8B5CF6', // Violet
            '#10B981', // Emerald
            '#F43F5E', // Rose
            '#EAB308', // Yellow
            '#6366F1', // Indigo
            '#EC4899', // Pink
            '#14B8A6', // Teal
            '#F59E0B'  // Amber
        ];

        const results = candidates.map((candidate, index) => ({
            name: candidate.name,
            party: candidate.party,
            votes: candidate.voteCount,
            color: COLORS[index % COLORS.length], // Cycle through colors
            imageUrl: candidate.imageUrl
        }));

        // Add Abstains as a result entry
        if (election.abstainCount && election.abstainCount > 0) {
            results.push({
                name: 'Abstain',
                party: 'N/A',
                votes: election.abstainCount,
                color: '#64748b', // Slate-500 for neutral
                imageUrl: undefined
            });
        }

        // Sort results by votes descending
        results.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        res.json({
            publishedAt: election.publishedAt,
            totalVotes,
            winner: (() => {
                if (results.length === 0 || results[0].votes === 0) return null;
                // Check for tie
                const firstVotes = results[0].votes;
                const tiedCandidates = results.filter(r => r.votes === firstVotes);
                return tiedCandidates.length === 1 ? tiedCandidates[0] : null; // Return null on tie
            })(),
            results: results,
            isTie: results.length > 0 && results[0].votes > 0 && results.filter(r => r.votes === results[0].votes).length > 1
        });

    } catch (error) {
        console.error('Error fetching public results:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get election configuration (Public)
// @route   GET /api/election
// @access  Public
export const getElectionConfig = async (req: Request, res: Response) => {
    try {
        // Find the single election document, or create if it doesn't exist
        let election = await Election.findOne();

        if (!election) {
            return res.status(404).json({ message: 'Election not configured' });
        }

        res.json(election);
    } catch (error) {
        console.error('Error fetching election config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update election configuration
// @route   PUT /api/admin/election
// @access  Private/Admin
export const updateElectionConfig = async (req: Request, res: Response) => {
    try {
        const { title, description, startDate, endDate } = req.body;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        let election = await Election.findOne();

        if (election) {
            election.title = title || election.title;
            election.description = description || election.description;
            election.startDate = startDate || election.startDate;
            election.endDate = endDate || election.endDate;

            const updatedElection = await election.save();

            // Broadcast Notification
            const voters = await User.find({ role: UserRole.VOTER });
            const notifications = voters.map(voter => ({
                user: voter._id,
                type: 'info',
                title: 'Election Update',
                message: `Election information has been updated: ${title || election.title}`
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            res.json(updatedElection);
        } else {
            // Should not happen usually as GET creates it, but safe to handle
            const newElection = await Election.create({
                title,
                description,
                startDate,
                endDate
            });
            res.json(newElection);
        }

    } catch (error) {
        console.error('Error updating election config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Toggle election results publishing
// @route   PUT /api/admin/election/publish
// @access  Private/Admin
export const togglePublishResults = async (req: Request, res: Response) => {
    try {
        const { publish } = req.body; // true or false
        let election = await Election.findOne();

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        election.resultsPublished = publish;
        if (publish) {
            election.publishedAt = new Date();
        } else {
            election.publishedAt = undefined;
        }

        await election.save();

        // Broadcast Notification
        if (publish) {
            const voters = await User.find({ role: UserRole.VOTER });
            const notifications = voters.map(voter => ({
                user: voter._id,
                type: 'success',
                title: 'Results Published',
                message: 'Election results have been published! Check the dashboard.'
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.json({
            message: `Results ${publish ? 'published' : 'unpublished'} successfully`,
            resultsPublished: election.resultsPublished,
            publishedAt: election.publishedAt
        });

    } catch (error) {
        console.error('Error toggling publish state:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Emergency stop election
// @route   POST /api/admin/election/stop
// @access  Private/Admin
export const emergencyStopElection = async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to confirm this action' });
        }

        // Verify Admin Password
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Action denied.' });
        }

        let election = await Election.findOne();
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Stop the election by setting endDate to NOW
        election.endDate = new Date();
        await election.save();

        res.json({
            message: 'Election has been stopped successfully.',
            election
        });

    } catch (error) {
        console.error('Error stopping election:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset election data
// @route   POST /api/admin/election/reset
// @access  Private/Admin
export const resetElection = async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to confirm this action' });
        }

        // Verify Admin Password
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Action denied.' });
        }

        const session = await User.startSession();
        session.startTransaction();

        try {
            // 1. Reset Candidates
            await Candidate.updateMany({}, { voteCount: 0 }, { session });

            // 2. Reset Users (hasVoted = false)
            await User.updateMany({ role: UserRole.VOTER }, { hasVoted: false }, { session });

            // 3. Reset Election Stats
            await Election.updateMany({}, {
                abstainCount: 0,
                resultsPublished: false,
                publishedAt: undefined
            }, { session });

            await session.commitTransaction();
            session.endSession();

            res.json({ message: 'Election data has been reset successfully.' });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.error('Error resetting election:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
