import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current dir
dotenv.config();

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // We will fill this after deployment

// ABI (Application Binary Interface) - The "Menu" of available functions on our contract
// We can copy this from smart-contracts/artifacts/contracts/Election.sol/Election.json after compilation
// For now, I will hardcode the essential parts we need.
const CONTRACT_ABI = [
    "function vote(string memory _candidateId) public",
    "function addCandidate(string memory _id, string memory _name) public",
    "function getAllCandidates() public view returns (tuple(string id, string name, uint256 voteCount)[])"
];

let contract: ethers.Contract | null = null;
let wallet: ethers.Wallet | null = null;

if (RPC_URL && PRIVATE_KEY && CONTRACT_ADDRESS) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        console.log("✅ Blockchain connected successfully");
    } catch (error) {
        console.error("❌ Failed to connect to blockchain:", error);
    }
} else {
    console.warn("⚠️ Blockchain credentials missing in .env. Blockchain features will be disabled.");
}

export { contract, wallet };
