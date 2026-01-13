import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from '../src/models/Candidate';
import path from 'path';
import { ethers } from 'ethers';

dotenv.config({ path: path.join(__dirname, '../.env') });

const CONTRACT_ABI = [
    "function addCandidate(string memory _id, string memory _name) public",
    "function getCandidate(string memory _id) public view returns (string memory, string memory, uint256)"
];

const syncCandidates = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
        if (!process.env.SEPOLIA_RPC_URL) throw new Error('SEPOLIA_RPC_URL missing');
        if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY missing');
        if (!process.env.CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS missing');

        // Connect DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Connect Blockchain
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        console.log('✅ Connected to Blockchain');

        const candidates = await Candidate.find({});
        console.log(`Found ${candidates.length} candidates in DB.`);

        for (const candidate of candidates) {
            const id = candidate._id.toString();
            console.log(`Checking candidate: ${candidate.name} (${id})...`);

            try {
                // Check if exists
                const onChain = await contract.getCandidate(id);
                // onChain returns [id, name, voteCount]

                if (onChain[0] && onChain[0].length > 0) {
                    console.log(`   -> Already on-chain. Skipping.`);
                } else {
                    console.log(`   -> NOT on-chain. Adding...`);
                    const tx = await contract.addCandidate(id, candidate.name);
                    console.log(`      Tx Hash: ${tx.hash}`);
                    await tx.wait(); // Wait for confirmation
                    console.log(`      ✅ Confirmed.`);
                }
            } catch (e: any) {
                // getCandidate might verify or return empty struct? 
                // In code: candidates[_id] returns struct. If unitialized, strings are empty.
                // So checking onChain[0] (id) length > 0 is correct.
                console.error(`Error checking candidate ${candidate.name}:`, e.message);
            }
        }

        console.log("\nSync Complete!");
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

syncCandidates();
