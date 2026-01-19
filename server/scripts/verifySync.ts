
import dotenv from 'dotenv';
import path from 'path';
import { contract, wallet } from '../src/config/blockchain';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verify = async () => {
    if (!contract) {
        console.log("No contract connection");
        return;
    }
    try {
        console.log("Fetching candidates from blockchain...");
        const candidates = await contract.getAllCandidates();
        console.log(`Found ${candidates.length} candidates on blockchain.`);
        candidates.forEach((c: any) => {
            console.log(`- ${c.name} (${c.id}) - Votes: ${c.voteCount}`);
        });
    } catch (e: any) {
        console.log("Verification Error:", e.message);
    }
}

verify();
