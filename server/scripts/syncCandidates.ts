
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
                // We can check if the ID is in `candidateIds` via `getAllCandidates` or just try to add.
                // Our contract's `addCandidate` checks `if (bytes(candidates[_id].id).length == 0)` internally!
                // So we can just call addCandidate. If it exists, it will overwrite/update (or redundant event).
                // Actually, reading the contract:
                // `if (bytes(candidates[_id].id).length == 0) { candidateIds.push(_id); }`
                // `candidates[_id] = Candidate(_id, _name, 0);`
                // So it UPSERTS. This is safe to run multiple times.

                console.log(`Sending transaction to add/update candidate...`);
                // Note: _id is ObjectId, need toString()
                const tx = await contract.addCandidate(candidate._id.toString(), candidate.name);
                console.log(`Tx sent: ${tx.hash}`);
                console.log(`Waiting for confirmation...`);
                const receipt = await tx.wait();
                console.log(`✅ Synced! Block: ${receipt.blockNumber}`);

            } catch (err: any) {
                console.error(`❌ Failed to sync ${candidate.name}:`, err.message);
            }
        }

        console.log("\n___________________________________");
        console.log("🎉 Sync Process Complete");

    } catch (error) {
        console.error("Fatal Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

syncCandidates();
