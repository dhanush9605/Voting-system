
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkOwner() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

        console.log(`My Address: ${wallet.address}`);

        const contractAddress = process.env.CONTRACT_ADDRESS!;
        console.log(`Contract: ${contractAddress}`);

        const abi = ["function owner() view returns (address)"];
        const contract = new ethers.Contract(contractAddress, abi, provider);

        const owner = await contract.owner();
        console.log(`Contract Owner: ${owner}`);

        if (owner.toLowerCase() === wallet.address.toLowerCase()) {
            console.log("✅ YOU ARE THE OWNER");
        } else {
            console.log("❌ YOU ARE NOT THE OWNER");
        }

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

checkOwner();
