import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { VerificationStatus } from '../src/models/User';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixFaceData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ imageHash: { $exists: true, $ne: null } });
        let fixedCount = 0;

        console.log(`Checking ${users.length} users with face data...`);

        for (const user of users) {
            if (!user.imageHash) continue;

            const isArray = user.imageHash.trim().startsWith('[');

            if (!isArray) {
                console.log(`Fixing user ${user.email} (${user._id}): Invalid imageHash format.`);

                // Reset face data
                user.imageHash = undefined;
                user.verificationStatus = VerificationStatus.PENDING;

                await user.save();
                fixedCount++;
            } else {
                // Try parsing to be sure
                try {
                    JSON.parse(user.imageHash);
                } catch (e) {
                    console.log(`Fixing user ${user.email} (${user._id}): JSON parse error.`);
                    user.imageHash = undefined;
                    user.verificationStatus = VerificationStatus.PENDING;
                    await user.save();
                    fixedCount++;
                }
            }
        }

        console.log(`\nFinished! Fixed ${fixedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixFaceData();
