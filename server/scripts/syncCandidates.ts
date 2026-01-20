
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Candidate from '../src/models/Candidate';
import { contract, wallet } from '../src/config/blockchain';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const syncCandidates = async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        console.log("🔗 Connecting to Blockchain...");
        if (!contract || !wallet) {
            throw new Error("Blockchain not configured (Check RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS)");
        }
        console.log(`✅ Blockchain Connected. Contract: ${contract.target}`);

        // Fetch all candidates
        const candidates = await Candidate.find({});
        console.log(`Found ${candidates.length} candidates in DB.`);

        for (const candidate of candidates) {
            console.log(`\n-----------------------------------`);
            console.log(`Processing: ${candidate.name} (${candidate._id})`);

            try {
                // Check if candidate already exists on chain
                // The contract has `candidates(string id)` mapping but it returns a struct. 
                const tx = await contract.addCandidate(
                    candidate._id.toString(),
                    candidate.name
                );
                console.log(`Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`✅ Synced: ${candidate.name}`);
            } catch (error: any) {
                console.error(`❌ Failed to sync ${candidate.name}:`, error.message);
            }
        }

        console.log("🎉 Sync Process Complete");
        process.exit(0);
    } catch (error) {
        console.error("Fatal Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

syncCandidates();
