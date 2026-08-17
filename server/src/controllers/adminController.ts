import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js'; // Ensure this is exported
import User, { VerificationStatus } from '../models/User.js';
import Election from '../models/Election.js';
import { wallet } from '../config/blockchain.js';
import { ethers } from 'ethers';

import { UserRole } from '../models/User.js';
import Notification from '../models/Notification.js';
import Candidate from '../models/Candidate.js';
import Settings from '../models/Settings.js';
import { sendEmail } from '../utils/email.js';

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
        const { status, rejectionReason } = req.body;
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
        if (status === VerificationStatus.REJECTED) {
            user.rejectionReason = rejectionReason;
        } else {
            user.rejectionReason = undefined;
        }
        await user.save();

        // Create Notification
        await Notification.create({
            user: user._id,
            type: status === VerificationStatus.VERIFIED ? 'success' : 'error',
            title: status === VerificationStatus.VERIFIED ? 'Verification Approved' : 'Verification Rejected',
            message: status === VerificationStatus.VERIFIED
                ? 'Your account has been verified. You can now vote.'
                : `Your verification was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please check your details.'}`
        });

        // Send Email Notification (Fire & Forget)
        sendEmail({
            to: user.email,
            subject: status === VerificationStatus.VERIFIED ? 'Voter Verification Approved' : 'Verification Status Update',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: ${status === VerificationStatus.VERIFIED ? '#0F766E' : '#9f1239'};">
                        ${status === VerificationStatus.VERIFIED ? 'Verification Approved! 🎉' : 'Verification Application Update'}
                    </h2>
                    <p>Hi ${user.name},</p>
                    <p>
                        ${status === VerificationStatus.VERIFIED
                    ? 'Congratulations! Your voter account has been <strong>verified</strong> by the administration.'
                    : `We regret to inform you that your voter verification request has been <strong>rejected</strong>.${rejectionReason ? `<br><br><strong>Reason:</strong> ${rejectionReason}` : ''}`}
                    </p>
                    ${status === VerificationStatus.VERIFIED
                    ? '<p>You are now eligible to cast your vote in the upcoming election.</p>'
                    : '<p>Please contact the administration office for more details or to resubmit your application.</p>'
                }
                    <br>
                    <p>Best regards,<br>Voting System Board</p>
                </div>
            `
        }).catch(err => console.error("Verification Email Failed:", err));

        res.json({
            message: `User ${status === VerificationStatus.VERIFIED ? 'verified' : 'rejected'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verificationStatus: user.verificationStatus,
                rejectionReason: user.rejectionReason
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
        const activeElection = await Election.findOne({ status: 'active' });
        const candidatesCount = activeElection ? await Candidate.countDocuments({ electionId: activeElection._id }) : 0;
        const abstainCount = activeElection?.abstainCount || 0;

        // Sum total votes from candidates + abstains for the active election
        const votesCast = activeElection ? await User.countDocuments({ votedElections: activeElection._id }) : 0;

        const candidates = activeElection ? await Candidate.find({ electionId: activeElection._id }) : [];

        // Pie Chart Data: Votes by Party for ACTIVE election
        const votesByParty = activeElection ? await Candidate.aggregate([
            { $match: { electionId: activeElection._id } },
            {
                $group: {
                    _id: "$party",
                    value: { $sum: "$voteCount" }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]) : [];

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

        // Blockchain Stats
        let blockchainStats = {
            connected: false,
            network: 'Unknown',
            address: '',
            balance: '0.00'
        };

        if (wallet) {
            try {
                const balanceWei = await wallet.provider?.getBalance(wallet.address);
                const balanceEth = balanceWei ? ethers.formatEther(balanceWei) : '0.0';

                blockchainStats = {
                    connected: true,
                    network: 'Sepolia', // Hardcoded for now as per config
                    address: wallet.address,
                    balance: parseFloat(balanceEth).toFixed(4)
                };
            } catch (err) {
                console.error("Error fetching blockchain balance:", err);
            }
        }

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
            blockchain: blockchainStats,
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
        const { electionId } = req.query;
        let query: any = {};
        
        if (electionId) {
            query.electionId = electionId;
        } else {
            const activeElection = await Election.findOne({ status: 'active' });
            if (activeElection) {
                query.electionId = activeElection._id;
            }
        }

        const candidates = await Candidate.find(query);

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

// @desc    Get global settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

// Converts relative duration strings (e.g. "2", "30m", "2h") into absolute ISO timestamps
// so the target time persists correctly across page refreshes.
function convertToAbsoluteTargetTime(inputStr: string): string {
    if (!inputStr || !inputStr.trim()) return "";

    const trimmed = inputStr.trim().toLowerCase();

    // Pure number -> hours, e.g. "2" -> 2 hours from now
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return new Date(Date.now() + parseFloat(trimmed) * 3600 * 1000).toISOString();
    }

    // Hours syntax, e.g. "2h", "2hr", "2 hours"
    const hourMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
    if (hourMatch) {
        return new Date(Date.now() + parseFloat(hourMatch[1]) * 3600 * 1000).toISOString();
    }

    // Minutes syntax, e.g. "30m", "30 min", "45 minutes"
    const minMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
    if (minMatch) {
        return new Date(Date.now() + parseFloat(minMatch[1]) * 60 * 1000).toISOString();
    }

    // Already an absolute date string — preserve as-is
    const parsed = new Date(inputStr);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
    }

    return inputStr;
}

// @desc    Update global settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const { 
            emailNotificationsEnabled, 
            maintenanceMode, 
            maintenanceTitle, 
            maintenanceMessage, 
            estimatedEndTime, 
            allowAdminBypass 
        } = req.body;
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }
        
        if (emailNotificationsEnabled !== undefined) {
            settings.emailNotificationsEnabled = emailNotificationsEnabled;
        }

        if (maintenanceMode !== undefined) {
            settings.maintenanceMode = maintenanceMode;
        }

        if (maintenanceTitle !== undefined) {
            settings.maintenanceTitle = maintenanceTitle;
        }

        if (maintenanceMessage !== undefined) {
            settings.maintenanceMessage = maintenanceMessage;
        }

        if (estimatedEndTime !== undefined) {
            settings.estimatedEndTime = convertToAbsoluteTargetTime(estimatedEndTime);
        }

        if (allowAdminBypass !== undefined) {
            settings.allowAdminBypass = allowAdminBypass;
        }

        await settings.save();
        res.json(settings);
    } catch (error: any) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
};

// @desc    Get public system settings (maintenance mode, public info)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        let finalEstimatedEndTime = settings.estimatedEndTime ?? '';
        
        // If the DB has a relative duration (legacy), convert it to absolute time 
        // based on when the settings were last updated, so all clients sync perfectly.
        if (finalEstimatedEndTime) {
            const parsed = new Date(finalEstimatedEndTime);
            if (isNaN(parsed.getTime())) {
                const trimmed = finalEstimatedEndTime.trim().toLowerCase();
                const baseDate = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
                
                if (/^\d+(\.\d+)?$/.test(trimmed)) {
                    finalEstimatedEndTime = new Date(baseDate + parseFloat(trimmed) * 3600 * 1000).toISOString();
                } else {
                    const hourMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
                    if (hourMatch) {
                        finalEstimatedEndTime = new Date(baseDate + parseFloat(hourMatch[1]) * 3600 * 1000).toISOString();
                    } else {
                        const minMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
                        if (minMatch) {
                            finalEstimatedEndTime = new Date(baseDate + parseFloat(minMatch[1]) * 60 * 1000).toISOString();
                        }
                    }
                }
            }
        }

        res.json({
            maintenanceMode: settings.maintenanceMode ?? false,
            maintenanceTitle: settings.maintenanceTitle ?? 'System Under Maintenance',
            maintenanceMessage: settings.maintenanceMessage ?? 'Vora is currently undergoing scheduled maintenance to improve system performance and security. Please check back soon.',
            estimatedEndTime: finalEstimatedEndTime,
            allowAdminBypass: settings.allowAdminBypass ?? true
        });
    } catch (error: any) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ message: 'Error fetching public settings' });
    }
};
