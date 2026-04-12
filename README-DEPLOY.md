# 🚀 Mission: Vora Deployment
Welcome, Agent. Your mission, should you choose to accept it, is to deploy the world's most secure hybrid voting system. Follow these instructions precisely to ensure a successful launch.

## 🛠️ Step 1: Prepare the Gear (Prerequisites)
- **Node.js**: The engine (v18+ recommended).
- **MongoDB**: Our secure warehouse (Atlas URI or local).
- **Sepolia ETH**: Fuel for the blockchain (Get it from a faucet).

## 📡 Step 2: Establish the Signal (.env Setup)
Create a `.env` file in the `server` directory. This is your secret frequency:

```env
PORT=5000
MONGO_URI=mongodb+srv://... (or local)
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_other_secret_key
NODE_ENV=development

# Blockchain Intel (Alchemy/Sepolia)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
PRIVATE_KEY=your_relay_wallet_private_key
CONTRACT_ADDRESS=0x...
```

## 🏗️ Step 3: Build the Foundation (Backend)
1. `cd server`
2. `npm install` (Gathering intel...)
3. `npm run dev` (Ignition! 🚀)

## 🎨 Step 4: Paint the Target (Frontend)
1. Return to the root.
2. `npm install`
3. `npm run dev` (Visuals online! 💻)

## ⛓️ Step 5: Secure the Chain (Smart Contracts)
If you're deploying your own contract:
1. `cd smart-contracts`
2. `npx hardhat compile`
3. `npx hardhat run scripts/deploy.ts --network sepolia` 

## ☁️ Step 6: Go Global (Vercel)
The project is "Serverless-ready":
1. Connect your repo to Vercel.
2. Add all `.env` variables to Vercel Settings.
3. Push to `main`. Mission complete.

---
*This document will self-destruct if you accidentally share your PRIVATE_KEY. (Not really, but seriously, keep it secret.)*
