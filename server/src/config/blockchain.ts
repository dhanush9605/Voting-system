import { ethers } from 'ethers';


const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // We will fill this after deployment

// ABI (Application Binary Interface) - The "Menu" of available functions on our contract
// We can copy this from smart-contracts/artifacts/contracts/Election.sol/Election.json after compilation
// For now, I will hardcode the essential parts we need.
const CONTRACT_ABI = [
    "function vote(string memory _candidateId) public",
    "function addCandidate(string memory _id, string memory _name) public",
    "function getAllCandidates() public view returns (tuple(string id, string name, uint256 voteCount)[])",
    "function candidates(string memory) public view returns (string id, string name, uint256 voteCount)"
];

let contract: ethers.Contract | null = null;
let wallet: ethers.Wallet | null = null;

if (RPC_URL && PRIVATE_KEY) {
    // Check if PRIVATE_KEY is a placeholder or not a valid hex string
    const isPlaceholder = PRIVATE_KEY.includes('your_wallet_private_key') || PRIVATE_KEY.length < 32;
    
    if (isPlaceholder) {
        console.warn("⚠️ Blockchain PRIVATE_KEY appears to be a placeholder or invalid. Blockchain features disabled.");
    } else {
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            wallet = new ethers.Wallet(PRIVATE_KEY, provider);

            if (CONTRACT_ADDRESS && !CONTRACT_ADDRESS.includes('your_deployed_contract_address')) {
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
                console.log("✅ Blockchain connected successfully");
            } else {
                console.warn("⚠️ Blockchain wallet connected, but CONTRACT_ADDRESS is missing or placeholder. Voting functions disabled.");
            }
        } catch (error) {
            console.error("❌ Failed to connect to blockchain:", error);
        }
    }
} else {
    console.warn("⚠️ Blockchain credentials (RPC_URL or PRIVATE_KEY) missing in .env. Blockchain features will be disabled.");
}

export { contract, wallet };
