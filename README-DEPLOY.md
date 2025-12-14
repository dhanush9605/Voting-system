# CampusVote Deployment & Runbook

## Prerequisites
- Node.js (v14+)
- MongoDB (Running locally or Atlas URI)

## Environment Variables
Create a `.env` file in the `server` directory with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusvote
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
NODE_ENV=development
# External API Keys (Optional for local mock)
# S3_BUCKET=...
# FACE_API_KEY=...
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
- **Registration**: `/api/auth/register` - Supports image upload (mock signed URL) and face hash.
- **Authentication**: JWT stored in httpOnly cookies.
- **Uploads**: Mock Signed URL generation `POST /api/uploads/signed-url`.
- **Face Verification**: Mock endpoints `POST /api/face/compare`.
- **Admin**: `GET /api/admin/pending-registrations`.

## Testing
Integration tests are located in `server/src/tests`. Run with `npm test` inside `server/`.
