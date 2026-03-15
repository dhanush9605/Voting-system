import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';

dotenv.config();


console.log('Backend Index: Initializing...');
export const app = express();
const PORT = process.env.PORT || 5000;

console.log('Backend Index: Connecting to DB...');
// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}
console.log('Backend Index: Configuring middlewares...');

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:8080',
        'https://voting2026.vercel.app',
        'http://localhost',
        'capacitor://localhost',
        'http://10.0.2.2'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Trust Proxy (Required for Secure Coookies on Render/Heroku)
app.set('trust proxy', 1);





import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import candidateRoutes from './routes/candidateRoutes';
import voteRoutes from './routes/voteRoutes';
import electionRoutes from './routes/electionRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/election', electionRoutes);

app.get('/', (req, res) => {
    res.send('Voting System API is running');
});

console.log('Backend Index: Routes configured.');

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Serve static assets in production - Handled by Vercel routing
/*
import path from 'path';
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../', 'dist', 'index.html'));
    });
}
*/

if (require.main === module && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
