import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; // Ensure this is exported
import User, { VerificationStatus } from '../models/User';

import { UserRole } from '../models/User';
import Candidate from '../models/Candidate';

// @desc    Get all voters
// @route   GET /api/admin/voters
// @access  Private/Admin
export const getAllVoters = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch all users with role 'voter'
        const users = await User.find({ role: UserRole.VOTER })
            .select('-password -refreshToken') // Exclude sensitive data
            .sort({ createdAt: -1 }); // Newest first

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify or reject a voter
// @route   PUT /api/admin/verify-voter/:id
// @access  Private/Admin
export const verifyVoter = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const userId = req.params.id;

        if (!status || ![VerificationStatus.VERIFIED, VerificationStatus.REJECTED].includes(status)) {
            res.status(400).json({ message: 'Invalid verification status' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.verificationStatus = status;
        await user.save();

        res.json({
            message: `User ${status === VerificationStatus.VERIFIED ? 'verified' : 'rejected'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verificationStatus: user.verificationStatus
            }
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a voter
// @route   DELETE /api/admin/voters/:id
// @access  Private/Admin
export const deleteVoter = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Prevent deleting non-voters (safety check) or admins
        if (user.role !== UserRole.VOTER) {
            res.status(403).json({ message: 'Can only delete voters' });
            return;
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: 'Voter deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting voter:', error);
        res.status(500).json({ message: 'Server error during deletion' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalRegistered = await User.countDocuments({ role: UserRole.VOTER });
        const verifiedVoters = await User.countDocuments({ role: UserRole.VOTER, verificationStatus: VerificationStatus.VERIFIED });
        const candidatesCount = await Candidate.countDocuments();

        // Sum total votes from candidates
        const candidates = await Candidate.find();
        const votesCast = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

        // Pie Chart Data: Votes by Party
        const votesByParty = await Candidate.aggregate([
            {
                $group: {
                    _id: "$party",
                    value: { $sum: "$voteCount" }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // Bar Chart Data: Daily Registrations (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const dailyRegistrations = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    role: UserRole.VOTER
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    votes: { $sum: 1 } // Reusing 'votes' key to match frontend expectation
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Recent Activity (Latest 5 voters)
        const recentUsers = await User.find({ role: UserRole.VOTER })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('name verificationStatus hasVoted createdAt updatedAt');

        const recentActivity = recentUsers.map(user => {
            let action = 'Registered';
            let status = 'pending';
            let time = user.createdAt;

            if (user.hasVoted) {
                action = 'Voted';
                status = 'voted';
                time = user.updatedAt; // Approximation
            } else if (user.verificationStatus === VerificationStatus.VERIFIED) {
                action = 'Verified';
                status = 'verified';
                time = user.updatedAt;
            }

            return {
                id: user._id,
                name: user.name,
                action,
                time: time,
                status
            };
        });

        res.json({
            stats: {
                totalRegistered,
                verifiedVoters,
                votesCast,
                candidates: candidatesCount
            },
            charts: {
                pieData: votesByParty.map((p, i) => ({ ...p, color: ['#0EA5E9', '#F97316', '#8B5CF6', '#D946EF'][i % 4] })),
                barData: dailyRegistrations.map(d => ({
                    day: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
                    votes: d.votes
                }))
            },
            recentActivity
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// @desc    Get detailed election results
// @route   GET /api/admin/results
// @access  Private/Admin
export const getElectionResults = async (req: AuthRequest, res: Response) => {
    try {
        const candidates = await Candidate.find();

        // Calculate total votes
        const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

        // Add abstains if we track them separately later. For now, just candidates.

        const results = candidates.map(candidate => ({
            name: candidate.name,
            party: candidate.party,
            votes: candidate.voteCount,
            color: 'hsl(var(--primary))', // Frontend can map colors or we can store them
            imageUrl: candidate.imageUrl
        }));

        res.json({
            totalVotes,
            results: results.sort((a, b) => b.votes - a.votes)
        });

    } catch (error: any) {
        console.error('Error fetching election results:', error);
        res.status(500).json({ message: 'Error fetching results' });
    }
};
