import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole, VerificationStatus } from '../models/User';
import Notification from '../models/Notification';
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
            // Send admin notification
            const admins = await User.find({ role: UserRole.ADMIN });
            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'info',
                title: 'New Voter Registration',
                message: `${user.name} (${user.studentId}) has registered and is pending verification.`
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

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
        const { email, studentId, password, faceDescriptor } = req.body;

        // Construct query based on what was provided
        const query = email ? { email } : { studentId };

        if (!email && !studentId) {
            res.status(400).json({ message: 'Please provide email or student ID' });
            return;
        }

        const user = await User.findOne(query);

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check for Lockout
        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            res.status(423).json({
                message: `Account is locked. Try again in ${minutesLeft} minutes.`
            });
            return;
        }

        if (await bcrypt.compare(password, user.password as string)) {
            // Credentials Matched. Now check for Biometrics if Voter.

            if (user.role === UserRole.VOTER) {
                // 1. Check if Face Data is present from registration
                if (!user.imageHash) {
                    // This is an edge case: Voter exists but has no face data.
                    // Ideally should not happen if rgistration enforces it.
                    // We allow login but maybe warn? Or blocking? 
                    // Let's allow for now to prevent lockout of legacy users, or BLOCK if strict.
                    // STRICT MODE:
                    // res.status(403).json({ message: 'Account incomplete. No face data found. Contact verification support.' });
                    // return;
                } else {
                    // 2. Check if faceDescriptor provided in request
                    if (!faceDescriptor) {
                        // Client needs to prompt for face
                        // Return 428 Precondition Required
                        res.status(428).json({
                            message: 'Face verification required',
                            required: 'face_descriptor'
                        });
                        return;
                    }

                    // 3. Verify Face
                    try {
                        const registeredDescriptor = JSON.parse(user.imageHash);
                        const distance = euclideanDistance(faceDescriptor, registeredDescriptor);
                        const THRESHOLD = 0.55;

                        if (distance > THRESHOLD) {
                            // Failed Face Check
                            console.log(`Login Failed: Face distance ${distance} > ${THRESHOLD}`);
                            res.status(401).json({ message: 'Face not recognized. Login failed.' });
                            return;
                        }
                        // Success -> Continue to token issuance
                    } catch (err) {
                        console.error("Login Face Verify Error:", err);
                        res.status(500).json({ message: 'Error verifying biometric data' });
                        return;
                    }
                }
            }

            // Success: Reset attempts
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();

            await sendTokenResponse(user, 200, res);
        } else {
            // Failure: Increment attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
                await user.save();
                res.status(423).json({ message: 'Account is locked due to too many failed attempts. Try again in 15 minutes.' });
                return;
            }

            await user.save();
            res.status(401).json({
                message: `Invalid credentials. ${5 - user.loginAttempts} attempts remaining.`
            });
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

const euclideanDistance = (desc1: number[], desc2: number[]): number => {
    if (desc1.length !== desc2.length) return 1.0; // Max distance
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

// @desc    Verify user face
// @route   POST /api/auth/verify-face
// @access  Private
export const verifyFace = async (req: AuthRequest, res: Response) => {
    try {
        const { faceDescriptor } = req.body;
        console.log("VerifyRequest: User ID:", req.user?._id);

        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            res.status(400).json({ message: 'Valid face descriptor is required' });
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.verificationStatus === VerificationStatus.VERIFIED) {
            res.status(200).json({ message: 'User is already verified', verified: true });
            return;
        }

        if (!user.imageHash) {
            console.log("VerifyRequest: No imageHash found for user");
            res.status(400).json({ message: 'No registered face data found for this user.' });
            return;
        }

        let registeredDescriptor: number[];
        try {
            registeredDescriptor = JSON.parse(user.imageHash);
        } catch (e) {
            res.status(500).json({ message: 'Error parsing registered face data' });
            return;
        }

        const distance = euclideanDistance(faceDescriptor, registeredDescriptor);
        console.log(`VerifyRequest: Distance=${distance}`);
        // Adjusted threshold to 0.45 for TinyFaceDetector (faster but slightly less accurate)
        const THRESHOLD = 0.45;

        if (distance < THRESHOLD) {
            user.verificationStatus = VerificationStatus.VERIFIED;
            await user.save();
            res.json({ message: 'Face verified successfully', verified: true, distance });
        } else {
            res.status(400).json({
                message: 'Face verification failed. Data does not match.',
                verified: false,
                distance
            });
        }

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
