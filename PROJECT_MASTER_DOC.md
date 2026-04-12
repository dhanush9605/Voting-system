**Hybrid Blockchain Voting System - Project Master Documentation**

**Date:** December 29, 2025
**Author:** Dhanush Rajesh

**1. Project Overview**
This project is a **Hybrid Voting System** that combines the user-friendly experience of a Web2 application (MERN Stack) with the security and immutability of Web3 (Ethereum Blockchain).

**Key Features Implemented:**
*   **Secure Authentication**: Role-based login (Admin & Voter) with Face ID verification logic.
*   **Dual-Database Storage**:
    *   **MongoDB**: Fast, instant retrieval for UI and user profiles.
    *   **Ethereum Blockchain (Sepolia)**: Permanent, tamper-proof record of every vote and candidate.
*   **Admin Dashboard**:
    *   Manage Candidates (Add/Edit/Delete).
    *   Real-time connection to Blockchain for candidate registration.
    *   View live results.
*   **Voter Dashboard**:
    *   Real-time verification status (Verified/Pending).
    *   Secure voting interface (One-person-one-vote enforcement).
    *   Automated blockchain transaction handling (Gasless for user).

---

**2. Technical Architecture**
*   **Frontend**: React, TypeScript, Tailwind CSS, Vite.
*   **Backend**: Node.js, Express, Mongoose (MongoDB).
*   **Blockchain**: Solidity (Smart Contracts), Hardhat (Development Framework), Ethers.js (Integration).
*   **Network**: Ethereum Sepolia Testnet.

---

**3. Biometric Security (Face & Liveness)**
The system uses advanced biometric checks to ensure every voter is a unique, real person.

**A. Registration (The "Enrollment" Phase)**
When a student first registers, they must pass a **Liveness Check** to prove they are a real human present at the camera, not a photo or video.
1.  **Head Tilt Challenge**: The user is asked to tilt their head (Left/Right) randomly.
2.  **Detection**: The system tracks the head pose in real-time. If the movement matches the prompt, it confirms "Liveness".
3.  **Storage**: Once verified live, the system captures 3 reference images of the face. These are encrypted and stored in the database as the "Face ID" template.

**B. Login (The "Verification" Phase)**
To vote or access the dashboard, the user simply looks at the camera.
1.  **Capture**: The camera takes a snapshot of the current user.
2.  **Comparison**: This snapshot is compared against the stored "Face ID" template from registration.
3.  **Threshold**: If the match confidence is above **0.45**, access is granted.
4.  **Benefits**: No passwords to forget, and impossible for one student to vote for another.

---

**3. Environment Variables & Configuration**
These are the critical configuration settings used in the project.

**A. Backend (server/.env)**
This file controls the API, Database, and Blockchain Wallet.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://dango66:123412dango@cluster.4wmcr8d.mongodb.net/voting-system?appName=Cluster

# Security
JWT_SECRET=52e68f0a5f1e26443f9e7fedd21ccb23f269634a709b47b932480cf35e294ef0

# --- BLOCKCHAIN INTEGRATION (New) ---
# Network Provider (Alchemy)
SEPOLIA_RPC_URL='https://eth-sepolia.g.alchemy.com/v2/xVJGlFAqBzJ-WWivky0ee'

# Master Wallet (Pays for Gas) - KEEP SECRET
PRIVATE_KEY='253384de2747313007839e7870faa306cb4e3ef0816831a13809fc1064a2da52'

# Deployed Smart Contract Address
CONTRACT_ADDRESS='0x1b7665b484568F96406B2d54871735839E2b5A7f'
```

**B. Frontend (.env.local or .env)**
This file tells the React app where to find the server.

```env
# Pointing to Local Backend (Fixed from previous IP issue)
VITE_API_URL=http://localhost:5000/api
```

---

**4. Implementation Steps (Log of Actions)**

**Phase 1: Stability & Fixes**
1.  **Fixed Login Loop**: The frontend was getting 401 errors. We fixed the `axios` interceptor and cookie handling.
2.  **Fixed Connectivity**: The `VITE_API_URL` was hardcoded to a specific LAN IP (`10.131...`). We reset this to `localhost` to allow stable local development.

**Phase 2: Blockchain Setup**
1.  **Environment Preparation**:
    *   Installed **MetaMask** and created a dedicated development wallet.
    *   Obtained free **Sepolia ETH** from a faucet.
    *   Created an **Alchemy App** to get an RPC node URL.
2.  **Smart Contract Development**:
    *   Created `smart-contracts/` directory using **Hardhat**.
    *   Wrote `Election.sol`: A Solidity contract to store Candidates (`id`, `name`) and Votes (`voteCount`).
    *   Compiled the contract using `npx hardhat compile`.

**Phase 3: Deployment**
1.  **Deployment Script**: Created `scripts/deploy.ts` to upload the contract to the network.
2.  **Execution**: Ran `npx hardhat run scripts/deploy.ts --network sepolia`.
3.  **Result**: Successfully deployed contract to `0x1b7665b484568F96406B2d54871735839E2b5A7f`.

**Phase 4: Integration (Backend <-> Blockchain)**
1.  **Configuration**: Created `server/src/config/blockchain.ts` to initialize the `ethers` provider and wallet.
2.  **Admin Integration**: Updated `candidateController.ts`. Now, when an Admin creates a candidate, it automatically calls `contract.addCandidate()` on the blockchain.
3.  **Voter Integration**: Updated `voteController.ts`. When a User votes, the server verifies them in MongoDB, then sends a transaction to `contract.vote()` on the blockchain.

**Phase 6: Multi-Election & Notifications**
1. **Dynamic Elections**: Created migration script `migrate-to-multi-election.ts` to transform the database into a multi-session structure. 
2. **Notification Logic**: Implemented `Notification.ts` model and related routes to provide real-time user feedback.
3. **API Expansion**: Comprehensive updates to `adminRoutes.ts` and `authRoutes.ts` to support detailed dashboard stats and notification management.
4. **Documentation**: Overhauled `README.md` and `README-DEPLOY.md` to move away from placeholders and mock descriptions toward a production-ready manual.

---

**5. How to Run**
1.  **Start Backend**:
    ```bash
    cd server
    npm run dev
    ```
2.  **Start Frontend**:
    ```bash
    # In a new terminal
    npm run dev
    ```
3.  **Access App**: Open `http://localhost:8080`.
