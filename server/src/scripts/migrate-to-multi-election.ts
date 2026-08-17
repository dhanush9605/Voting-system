import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Election from '../models/Election';
import Candidate from '../models/Candidate';
import User from '../models/User';
import connectDB from '../config/db';



const migrate = async () => {
    try {
        await connectDB();
        console.log('📡 Connected to database for migration...');

        // 1. Ensure an Active Election exists
        let activeElection = await Election.findOne({ status: 'active' });
        
        if (!activeElection) {
            console.log('ℹ️ No active election found. Creating one...');
            activeElection = await Election.create({
                title: 'Primary Election Session',
                description: 'The root/original election data.',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'active'
            });
            console.log(`✅ Created Primary Election: ${activeElection._id}`);
        } else {
            console.log(`✅ Using existing Active Election: ${activeElection._id}`);
        }

        const electionId = activeElection._id;

        // 2. Update Candidates
        const candResult = await Candidate.updateMany(
            { electionId: { $exists: false } },
            { $set: { electionId: electionId } }
        );
        console.log(`📝 Updated ${candResult.modifiedCount} candidates with electionId.`);

        // 3. Update Users who have voted
        console.log('🕒 Migrating user voting records...');
        const voters = await User.find({ hasVoted: true, votedElections: { $size: 0 } });
        
        let voterUpdates = 0;
        for (const voter of voters) {
            voter.votedElections.push(electionId as any);
            voter.votingRecords.push({
                electionId: electionId as any,
                transactionHash: voter.voteTransactionHash,
                votedAt: voter.votedAt || new Date()
            });
            await voter.save();
            voterUpdates++;
        }
        console.log(`✅ Migrated ${voterUpdates} user voting records.`);

        console.log('🚀 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
