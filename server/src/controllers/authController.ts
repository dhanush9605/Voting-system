import { Request, Response } from 'express';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole, VerificationStatus } from '../models/User';
import Notification from '../models/Notification';
import Election from '../models/Election';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../utils/email';



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

const euclideanDistance = (desc1: number[], desc2: number[]): number => {
    if (desc1.length !== desc2.length) return 1.0; // Max distance
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

const sendTokenResponse = async (user: IUser, statusCode: number, res: Response, rememberMe: boolean = false) => {
    const accessToken = generateAccessToken((user._id as unknown) as string);
    const refreshToken = generateRefreshToken((user._id as unknown) as string);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || process.env.VERCEL === '1';

    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS required for None
        sameSite: isProduction ? 'none' : 'lax', // Must be 'none' for cross-site
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    const refreshTokenOptions: any = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth/refresh' // Restrict to refresh endpoint
    };

    if (rememberMe) {
        refreshTokenOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    // Else: No maxAge -> Session cookie (cleared on browser close)

    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        rejectionReason: user.rejectionReason,
        isFaceVerified: user.isFaceVerified,
        hasVoted: user.hasVoted,
        imageUrl: user.imageUrl,
        idCardUrl: user.idCardUrl,
        voteTransactionHash: user.voteTransactionHash,
        votedAt: user.votedAt
    });
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, studentId, imageHash, imageUrl, idCardUrl } = req.body;

        if (role === UserRole.ADMIN || role === 'admin') {
            res.status(400).json({ message: 'Registration of Administrator accounts is not permitted.' });
            return;
        }

        const userExists = await User.findOne({ $or: [{ email }, { studentId }] });

        if (userExists) {
            const message = userExists.email === email
                ? 'User with this email already exists'
                : 'User with this Student ID already exists';
            res.status(400).json({ message });
            return;
        }

        // --- Duplicate Face Check Start ---
        if (imageHash) {
            try {
                const newFaceDescriptor = JSON.parse(imageHash);

                // Fetch only users that actually have a face registered
                // Limit to the last 200 users to prevent extreme slowness in registration
                // In a massive app, this should be replaced by a vector similarity search (Pinecone, etc.)
                const existingUsers = await User.find({
                    imageHash: { $exists: true, $ne: null }
                })
                    .sort({ createdAt: -1 })
                    .limit(200)
                    .select('imageHash email');

                const DUPLICATE_THRESHOLD = 0.45; // Strict threshold for registration

                for (const existingUser of existingUsers) {
                    if (!existingUser.imageHash) continue;
                    if (!existingUser.imageHash.trim().startsWith('[')) continue;

                    try {
                        const existingDescriptor = JSON.parse(existingUser.imageHash);
                        const distance = euclideanDistance(newFaceDescriptor, existingDescriptor);

                        if (distance < DUPLICATE_THRESHOLD) {
                            console.log(`Duplicate Registration Attempt: Face matches user ${existingUser._id} (${existingUser.email}) with distance ${distance}`);
                            res.status(400).json({
                                message: 'This face is already registered with another account.'
                            });
                            return;
                        }
                    } catch (e) {
                        // Skip malformed data
                        continue;
                    }
                }
            } catch (error) {
                console.error('Error processing face descriptor during registration:', error);
                res.status(400).json({ message: 'Invalid face data provided.' });
                return;
            }
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
            imageUrl,
            idCardUrl
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

            // Send Welcome Email (Fire & Forget)
            sendEmail({
                to: user.email,
                subject: 'Welcome to Voting System',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0F766E;">Welcome to Voting System!</h2>
                        <p>Hi ${user.name},</p>
                        <p>Thank you for registering. Your account has been created successfully.</p>
                        <p><strong>Student ID:</strong> ${user.studentId}</p>
                        <p>Your account is currently <strong>Pending Verification</strong>. You will receive another email once an admin reviews your details.</p>
                        <br>
                        <p>Best regards,<br>Voting System Team</p>
                    </div>
                `
            }).catch(err => console.error("Welcome Email Failed:", err));

            // Send Admin Alert Email (Fire & Forget)
            sendEmail({
                to: (process.env.SENDER_EMAIL || process.env.EMAIL_USER) as string,
                subject: 'New Voter Registration Alert 🚨',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0F766E;">New Voter Registration</h2>
                        <p>A new user has registered and is awaiting verification.</p>
                        <ul>
                            <li><strong>Name:</strong> ${user.name}</li>
                            <li><strong>Student ID:</strong> ${user.studentId}</li>
                            <li><strong>Email:</strong> ${user.email}</li>
                            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                        </ul>
                        <p>Please log in to the <a href="${process.env.ADMIN_FRONTEND_URL || 'http://localhost:8081'}">Admin Dashboard</a> to verify this user.</p>
                    </div>
                `
            }).catch(err => console.error("Admin Alert Email Failed:", err));

            await sendTokenResponse(user, 201, res, false); // Registering = Default/No remember me or handle if needed
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
        const { email, studentId, password, faceDescriptor, rememberMe } = req.body;

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
                        const THRESHOLD = 0.60;

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

            await sendTokenResponse(user, 200, res, rememberMe);
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

        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || process.env.VERCEL === '1';

        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
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
    const user = await User.findById(req.user._id).populate('votingRecords.electionId', 'title startDate endDate');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus,
            rejectionReason: user.rejectionReason,
            isFaceVerified: user.isFaceVerified,
            hasVoted: user.hasVoted,
            imageUrl: user.imageUrl,
            idCardUrl: user.idCardUrl,
            voteTransactionHash: user.voteTransactionHash,
            votedAt: user.votedAt,
            votingRecords: user.votingRecords
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



// @desc    Update user profile data and documents
// @route   PUT /api/auth/update-face
// @access  Private
export const updateFaceData = async (req: AuthRequest, res: Response) => {
    try {
        const { imageHash, imageUrl, idCardUrl, name, studentId } = req.body;
        const user = await User.findById(req.user?._id);

        if (user) {
            // Check for student ID collision
            if (studentId && studentId !== user.studentId) {
                const existingUser = await User.findOne({ studentId });
                if (existingUser) {
                    return res.status(400).json({ message: 'Student ID is already registered.' });
                }
                user.studentId = studentId;
            }

            if (name) user.name = name;
            if (imageHash) user.imageHash = imageHash;
            if (imageUrl) user.imageUrl = imageUrl;
            if (idCardUrl) user.idCardUrl = idCardUrl;

            // If the user was rejected and they are updating their profile, reset status to pending
            if (user.verificationStatus === VerificationStatus.REJECTED) {
                user.verificationStatus = VerificationStatus.PENDING;
                user.rejectionReason = undefined;
            }

            await user.save();
            res.json({ 
                message: 'Profile updated successfully', 
                verificationStatus: user.verificationStatus,
                name: user.name,
                studentId: user.studentId
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify user face
// @route   POST /api/auth/verify-face
// @access  Private
export const verifyFace = async (req: AuthRequest, res: Response) => {
    try {
        const { faceDescriptor } = req.body;
        // console.log("VerifyRequest: User ID:", req.user?._id);

        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            res.status(400).json({ message: 'Valid face descriptor is required' });
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.isFaceVerified) {
            res.status(200).json({ message: 'User face is already verified', verified: true });
            return;
        }

        if (!user.imageHash) {
            console.warn("VerifyRequest: No imageHash found for user");
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
        // console.log(`VerifyRequest: Distance=${distance}`);
        // Adjusted threshold to 0.55
        const THRESHOLD = 0.55;

        if (distance < THRESHOLD) {
            user.isFaceVerified = true;
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


