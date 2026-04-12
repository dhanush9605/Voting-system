# 🗳️ VORA: Decentralized Hybrid Voting System

![Project Banner](public/hero-illustration.png)

> **VORA (Voting On-chain with Real-time Authentication)** is a State-of-the-Art Hybrid Voting Platform combining the performance of a Web2 MERN stack with the immutable security of the Ethereum Blockchain (Web3). Featuring advanced biometric authentication for a truly fair and transparent democratic process.

---

## 🌟 Key Features

### 🔐 Biometric Security (Face ID)
- **Liveness Detection**: Prevents spoofing (photo/video) using real-time head-tilt challenges.
- **Biometric Matching**: Zero-password login using AI face recognition (Match confidence threshold: 0.45).
- **One-Person-One-Vote**: Multi-layered verification ensures unique identity before any vote is cast.

### ⛓️ Hybrid Storage Architecture
- **MongoDB (Web2)**: Lightning-fast profile management, candidate retrieval, and session handling.
- **Ethereum Sepolia (Web3)**: Permanent, tamper-proof record of every candidate addition and vote cast.

### 🚀 Advanced Voter Experience
- **Gasless Transactions**: System handles all blockchain gas fees on behalf of the user using a server-side relay.
- **Real-time Tallies**: Dynamic results visualization as votes are verified and recorded on-chain.
- **Advanced Election Management**: Admins can create new election sessions, archive old ones, and maintain a history of all democratic processes (Multi-Election support).
- **Notification Center**: Real-time feedback for users regarding their verification status and voting confirmation.
- **Cross-Platform**: Web-optimized with Capacitor support for Android deployment.

---

## 📸 Project Showcase

> [!TIP]
> This section will be updated with high-resolution screenshots of your project once provided.

| Landing Page | Voter Dashboard |
| :---: | :---: |
| ![Landing Page](public/landing-page.png) | ![Voter Dashboard](public/voter-dashboard.png) |

| Admin Control Center | Face ID Verification |
| :---: | :---: |
| ![Admin Control Center](public/admin-dashboard.png) | ![Face ID Verification](public/face-id-verification.png) |

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB Atlas (Cluster v6.0+) |
| **Blockchain** | Solidity, Hardhat, Ethers.js v6 |
| **Network** | Ethereum Sepolia Testnet |
| **Biometrics** | Face-api.js (TensorFlow.js) |

---

## 📂 Project Structure

```text
├── android/               # Capacitor Android project
├── server/                # Backend (Express & Node.js)
│   ├── src/
│   │   ├── config/        # Database & Blockchain configs
│   │   ├── controllers/   # Request handlers (Auth, Vote, Admin)
│   │   ├── models/        # Mongoose Schemas (User, Candidate, Election)
│   │   └── routes/        # API Endpoints
├── smart-contracts/       # Web3 Layer (Solidity & Hardhat)
│   ├── contracts/         # Election.sol
│   └── scripts/           # Deployment & Verification scripts
├── src/                   # Frontend (React & Vite)
│   ├── components/        # Reusable Shadcn UI components
│   ├── hooks/             # Custom React hooks (Auth, Mobile)
│   └── pages/             # Main Views (Voter, Admin, Results)
└── public/                # Static assets (Models, Images)
```

---

## ⚙️ Architecture & Workflow

### 1. Enrollment & Registration
User registration requires a liveness test:
1. **Pose Challenge**: The UI asks the user to tilt their head (Left/Right) randomly.
2. **Analysis**: The `face-api.js` model tracks landmarks in real-time.
3. **Capture**: Once verified live, 3 reference snapshots are captured, hashed, and stored in MongoDB.

### 2. Candidate Lifecycle (Admin)
Admin creates a candidate in the dashboard. Two simultaneous operations occur:
- **Off-Chain**: A record is saved in MongoDB for instant frontend display.
- **On-Chain**: A `contract.addCandidate(mongoId, name)` transaction is sent to the Sepolia network. The MongoDB ID serves as the unique identifier on the blockchain.

### 3. The Voting Relay (Web3)
To eliminate UX friction (MetaMask popups/gas costs for students), VORA uses a **Server-Side Relay**:
1. **Auth**: Voter logs in via Face ID.
2. **Eligibility**: Server checks `isFaceVerified` and `hasVoted` in MongoDB.
3. **Relay**: The server's master wallet (configured via `PRIVATE_KEY`) triggers the `contract.vote(candidateId)` function.
4. **Receipt**: The resulting `transactionHash` is saved to the user's voting record in MongoDB for future verification.

---

## 📡 API Reference (Partial)

### Authentication & Profile
- `POST /api/auth/register`: Create new user profile.
- `POST /api/auth/login`: Face-based biometric login.
- `GET /api/auth/profile`: Fetch current user data and voting history.
- `PUT /api/auth/update-password`: Change user password.
- `PUT /api/auth/update-face`: Refresh stored biometric embeddings.

### Biometric & Uploads
- `POST /api/face/verify-face`: Run AI comparison on current snapshot.
- `POST /api/face/register-embedding`: Store face ID templates.
- `POST /api/uploads`: Securely upload face reference images.

### Voting & Elections
- `POST /api/vote`: Secure relay to cast a vote on-chain.
- `GET /api/vote/verify/:hash`: Check transaction status on the Sepolia network.
- `GET /api/election`: Fetch current active election configuration.
- `GET /api/election/results`: View public real-time tallies.

### Notifications
- `GET /api/auth/notifications`: Fetch user-specific notifications.
- `PUT /api/auth/notifications/:id/read`: Mark a single notification as read.
- `PUT /api/auth/notifications/read-all`: Mark all as read.

### Admin Dashboard (Protected)
- `GET /api/admin/dashboard`: Global stats (Voter turnout, reg status).
- `GET /api/admin/results`: Detailed per-candidate breakdown.
- `GET /api/admin/results/publish`: Toggle visibility of final results.
- `POST /api/admin/election/new`: Start a fresh election session.
- `POST /api/admin/election/stop`: Emergency election pause.
- `GET /api/admin/elections`: Browse historical election data.
- `GET /api/admin/voters`: Manage registered users and manual verifications.

---

## 🚀 Installation & Setup

### 1. Environment Variables
Create a `.env` in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_cluster_url
JWT_SECRET=your_jwt_signing_key
SEPOLIA_RPC_URL=alchemy_or_infura_url
PRIVATE_KEY=your_master_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_on_sepolia
```

### 2. Smart Contract Deployment
```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

### 3. Application Launch
```bash
# Terminal 1: Backend
cd server && npm install && npm run dev

# Terminal 2: Frontend
npm install && npm run dev
```

---

## 🛡️ Security Measures
- **Rate Limiting**: Prevents brute-force on API endpoints.
- **JWT Protection**: All sensitive routes are guarded by secure middleware.
- **Blockchain Immortality**: Once a vote is cast, it cannot be deleted or altered by any database admin.
- **Liveness Guard**: Prevents identity theft via high-resolution photos of registered users.

---

## 📜 License & Credits

Developed by **Dhanush Rajesh**. Built for the future of secure, accessible, and transparent digital democracy.

---
*VORA | Secure. Transparent. Decentralized.*
