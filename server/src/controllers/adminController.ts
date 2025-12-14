import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; // Ensure this is exported
import User, { VerificationStatus } from '../models/User';

import { UserRole } from '../models/User';

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
