
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User, { UserRole, VerificationStatus } from '../src/models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-system';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        const email = 'admin@verification.com';
        const password = 'AdminPass123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminData = {
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: UserRole.ADMIN,
            verificationStatus: VerificationStatus.VERIFIED,
            hasVoted: false,
            createdAt: new Date()
        };

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = hashedPassword;
            existingAdmin.role = UserRole.ADMIN; // Ensure role is admin
            existingAdmin.verificationStatus = VerificationStatus.VERIFIED;
            await existingAdmin.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new admin user...');
            await User.create(adminData);
            console.log('Admin user created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
