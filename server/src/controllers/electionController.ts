import { Request, Response } from 'express';
import Election from '../models/Election';
import Candidate from '../models/Candidate';
import User, { UserRole } from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification from '../models/Notification';
import { sendEmail } from '../utils/email';

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
            title: election.title,
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
            // Snapshot BEFORE modifying, to detect first-time creation
            const wasFirstSetup = !election.startDate;

            election.title = title || election.title;
            election.description = description || election.description;
            election.startDate = startDate || election.startDate;
            election.endDate = endDate || election.endDate;

            const updatedElection = await election.save();

            // Broadcast In-App Notification
            const voters = await User.find({ role: UserRole.VOTER }).select('name email');
            const notifications = voters.map(voter => ({
                user: voter._id,
                type: 'info',
                title: 'Election Update',
                message: `Election information has been updated: ${title || election.title}`
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            // Send Bulk Email to All Voters (Fire & Forget)
            const emailSubject = wasFirstSetup
                ? `📢 Election Announced: ${election.title}`
                : `📢 Election Updated: ${election.title}`;

            const startFormatted = new Date(election.startDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
            const endFormatted = new Date(election.endDate).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
            const frontendUrl = process.env.FRONTEND_URL || 'https://voting2026.vercel.app';

            Promise.allSettled(
                voters.map(voter =>
                    sendEmail({
                        to: voter.email,
                        subject: emailSubject,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 12px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <img src="${frontendUrl}/logo.png" alt="Logo" style="height: 48px; object-fit: contain;" />
                                </div>
                                <h2 style="color: #0F766E; text-align: center; margin-bottom: 4px;">${emailSubject}</h2>
                                <p style="text-align: center; color: #6b7280; margin-bottom: 24px;">You have a new update about the upcoming election.</p>
                                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px;"><strong>Election:</strong> ${title || election.title}</p>
                                    <p style="margin: 0 0 8px; color: #374151;">${description || election.description}</p>
                                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />
                                    <p style="margin: 0 0 6px;">🗓️ <strong>Voting Opens:</strong> ${startFormatted}</p>
                                    <p style="margin: 0;">🔒 <strong>Voting Closes:</strong> ${endFormatted}</p>
                                </div>
                                <p>Hi <strong>${voter.name}</strong>, make sure you are verified and ready to cast your vote before the deadline.</p>
                                <div style="text-align: center; margin: 28px 0;">
                                    <a href="${frontendUrl}/voter/dashboard" style="background-color: #0F766E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Go to Dashboard</a>
                                </div>
                                <p style="font-size: 11px; color: #9ca3af; text-align: center;">This is an automated notification from the Voting System.</p>
                            </div>
                        `
                    }).catch(err => console.error(`Email failed for ${voter.email}:`, err))
                )
            ).then(results => {
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) console.warn(`⚠️ ${failed} election-update emails failed to send.`);
                else console.log(`✅ Election update emails sent to ${voters.length} voters.`);
            });

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

        // Broadcast In-App Notification & Email
        if (publish) {
            const voters = await User.find({ role: UserRole.VOTER }).select('name email');
            const notifications = voters.map(voter => ({
                user: voter._id,
                type: 'success',
                title: 'Results Published',
                message: 'Election results have been published! Check the dashboard.'
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            // Load winner info for email
            const candidates = await Candidate.find().sort({ voteCount: -1 });
            const totalVotes = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0) + (election.abstainCount || 0);
            const topCandidate = candidates[0];
            const isTie = candidates.length > 1 && topCandidate?.voteCount === candidates[1]?.voteCount;
            const winnerLine = candidates.length === 0
                ? 'No candidate data available.'
                : isTie
                    ? '🤝 It\'s a tie! Check the results page for full details.'
                    : `🏆 <strong>${topCandidate.name}</strong> (${topCandidate.party}) leads with <strong>${topCandidate.voteCount}</strong> votes.`;

            const frontendUrl = process.env.FRONTEND_URL || 'https://voting2026.vercel.app';

            // Send Bulk Email to All Voters (Fire & Forget)
            Promise.allSettled(
                voters.map(voter =>
                    sendEmail({
                        to: voter.email,
                        subject: `🎉 Election Results Are Live: ${election.title}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 12px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <img src="${frontendUrl}/logo.png" alt="Logo" style="height: 48px; object-fit: contain;" />
                                </div>
                                <div style="background: linear-gradient(135deg, #0F766E, #0d9488); border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
                                    <h2 style="color: white; margin: 0 0 4px;">🎉 Results Are Live!</h2>
                                    <p style="color: #ccfbf1; margin: 0; font-size: 14px;">${election.title}</p>
                                </div>
                                <p>Hi <strong>${voter.name}</strong>,</p>
                                <p>The election results have officially been published. Thank you for participating!</p>
                                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                                    <p style="margin: 0 0 8px; font-size: 15px;">${winnerLine}</p>
                                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Total votes cast: <strong>${totalVotes}</strong></p>
                                </div>
                                <div style="text-align: center; margin: 28px 0;">
                                    <a href="${frontendUrl}/results/public" style="background-color: #0F766E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">View Full Results</a>
                                </div>
                                <p style="font-size: 11px; color: #9ca3af; text-align: center;">This is an automated notification from the Voting System.</p>
                            </div>
                        `
                    }).catch(err => console.error(`Results email failed for ${voter.email}:`, err))
                )
            ).then(results => {
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) console.warn(`⚠️ ${failed} results emails failed to send.`);
                else console.log(`✅ Results published emails sent to ${voters.length} voters.`);
            });
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
