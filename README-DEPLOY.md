# CampusVote Deployment & Runbook

## Prerequisites
- Node.js (v14+)
- MongoDB (Running locally or Atlas URI)

## Environment Variables
Create a `.env` file in the `server` directory with the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://... (or local)
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development

# Blockchain Integration (Alchemy/Sepolia)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
PRIVATE_KEY=your_relay_wallet_private_key
CONTRACT_ADDRESS=0x...
```

## Backend Setup
1. Navigate to server directory: `cd server`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Frontend Setup
1. Navigate to root directory.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Documentation
- **OpenAPI Spec**: `openapi.yaml` (in root)
- **Postman Collection**: `postman_collection.json` (in root) - Import this into Postman to test APIs.

## Features
- **Biometric Enrollment**: `/api/auth/register` - Real-time liveness check and face reference capture.
- **Authentication**: Secure JWT-based auth with face verification checkpoints.
- **On-Chain Voting**: Relayed transactions to Ethereum Sepolia via a master wallet provider.
- **Notifications**: Real-time user feedback system for election milestones.
- **Multi-Election**: Dynamic session management for recurring campus votes.

## Deployment (Vercel)
The project is configured for Vercel deployment (see `vercel.json`):
1. **Root**: Connect your GitHub repository to Vercel.
2. **Environment**: Add all `.env` variables in the Vercel project settings.
3. **Deploy**: Push to `main` for automatic deployment of both Frontend (Vite) and API (Serverless functions).

## Testing
Integration tests are located in `server/src/tests`. Run with `npm test` inside `server/`.
