import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';



const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
        expiresIn: '7d',
    });
};

const sendTokenResponse = async (user: IUser, statusCode: number, res: Response) => {
    const accessToken = generateAccessToken((user._id as unknown) as string);
    const refreshToken = generateRefreshToken((user._id as unknown) as string);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax', // Relax for dev
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax', // Relax for dev
        path: '/api/auth/refresh', // Restrict to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        hasVoted: user.hasVoted,
        imageHash: user.imageHash,
        imageUrl: user.imageUrl
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, studentId, imageHash, imageUrl } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { studentId }] });

        if (userExists) {
            const message = userExists.email === email
                ? 'User with this email already exists'
                : 'User with this Student ID already exists';
            res.status(400).json({ message });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || UserRole.VOTER,
            studentId,
            verificationStatus: 'pending',
            imageHash,
            imageUrl
        });

        if (user) {
            // Send admin notification (Placeholder for future implementation)
            // sendAdminNotification(user); 

            await sendTokenResponse(user, 201, res);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password as string))) {
            await sendTokenResponse(user, 200, res);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (Cookie)
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Not authorized, no refresh token' });
        }

        // Verify token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as { id: string };

        // Find user
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Not authorized, invalid refresh token' });
        }

        const accessToken = generateAccessToken((user._id as unknown) as string);
        const newRefreshToken = generateRefreshToken((user._id as unknown) as string);

        // Rotate refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Token refreshed' });

    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// @desc    Logout user / clear cookies
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req: AuthRequest, res: Response) => {
    // Optional: Clear refresh token from DB if you want strict logout
    if (req.user) {
        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }
    }

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.cookie('refresh_token', '', {
        httpOnly: true,
        path: '/api/auth/refresh',
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus,
            hasVoted: user.hasVoted,
            imageUrl: user.imageUrl,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id);

        if (user && (await bcrypt.compare(currentPassword, user.password as string))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
