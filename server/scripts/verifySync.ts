
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
        console.log("Checking specific candidate: 693c5cc74db102478e5877e7");
        // candidates returns (id, name, voteCount)
        const c = await contract.candidates("693c5cc74db102478e5877e7");
        console.log(`Result: ID=${c[0]}, Name=${c[1]}, Votes=${c[2]}`);

        if (c[0] === "693c5cc74db102478e5877e7") {
            console.log("✅ Candidate FOUND on blockchain!");
        } else {
            console.log("❌ Candidate NOT found (empty struct returned)");
        }

    } catch (e: any) {
        console.log("Verification Error:", e.message);
    }
}

verify();
