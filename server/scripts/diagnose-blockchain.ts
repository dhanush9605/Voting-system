import dotenv from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("--- Blockchain Config Diagnosis ---");
console.log(`CONTRACT_ADDRESS: ${process.env.CONTRACT_ADDRESS ? process.env.CONTRACT_ADDRESS : 'MISSING'}`);
console.log(`RPC_URL: ${process.env.SEPOLIA_RPC_URL ? process.env.SEPOLIA_RPC_URL : 'MISSING'}`);

const checkConnection = async () => {
    if (!process.env.SEPOLIA_RPC_URL) {
        console.log("❌ SEPOLIA_RPC_URL is missing.");
        return;
    }

    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

        if (process.env.CONTRACT_ADDRESS) {
            const code = await provider.getCode(process.env.CONTRACT_ADDRESS);
            if (code === '0x') {
                console.log("❌ Contract Address has NO CODE. It might be undeployed or on the wrong network.");
            } else {
                console.log("✅ Contract code found at address.");

                // Check Candidates
                try {
                    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, [
                        "function getAllCandidates() public view returns (tuple(string id, string name, uint256 voteCount)[])"
                    ], provider);

                    const candidates = await contract.getAllCandidates();
                    console.log(`📋 On-Chain Candidates: ${candidates.length}`);
                    candidates.forEach((c: any) => console.log(`   - [${c[0]}] ${c[1]} (Votes: ${c[2]})`));

                    if (candidates.length === 0) {
                        console.log("⚠️ NO CANDIDATES ON CHAIN! Run 'sync-candidates.ts' to fix this.");
                    }
                } catch (e: any) {
                    console.log(`⚠️ Failed to fetch candidates: ${e.message}`);
                }
            }
        } else {
            console.log("❌ CONTRACT_ADDRESS is missing in .env");
        }

        if (process.env.PRIVATE_KEY) {
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const balance = await provider.getBalance(wallet.address);
            const balanceInEth = ethers.formatEther(balance);

            console.log(`💰 Wallet Address: ${wallet.address}`);
            console.log(`💰 Wallet Balance: ${balanceInEth} ETH`);

            if (balanceInEth === '0.0') {
                console.log("❌ Wallet has 0 ETH. You need Sepolia ETH to pay for gas.");
            }
        } else {
            console.log("❌ PRIVATE_KEY is missing in .env");
        }

    } catch (e: any) {
        console.log(`❌ Failed to check blockchain: ${e.message}`);
    }
}

checkConnection();
