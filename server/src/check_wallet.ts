import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (privateKey) {
    try {
        const wallet = new ethers.Wallet(privateKey);
        console.log("Wallet Address from .env:", wallet.address);
    } catch (e: any) {
        console.error("Error with private key:", e.message);
    }
} else {
    console.log("No PRIVATE_KEY found in .env");
}
