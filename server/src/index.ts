import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import candidateRoutes from './routes/candidateRoutes';
import voteRoutes from './routes/voteRoutes';
import electionRoutes from './routes/electionRoutes';
import settingsRoutes from './routes/settingsRoutes';

export const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection Middleware (Ensures DB is ready before request hits routes)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed for request:', req.path);
        res.status(503).json({ message: 'Database connecting, please try again in a few seconds' });
    }
});

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'https://vora-network.vercel.app',
        'https://vora-voting.vercel.app',
        'https://vora-system.vercel.app',
        'https://vora.vercel.app',
        'http://localhost',
        'http://10.0.2.2'
    ];

app.use(cors({
    origin: (origin, callback) => {
        const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin || '');
        if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || isLocalNetwork) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust Proxy (Required for Secure Coookies on Vercel/Render)
app.set('trust proxy', 1);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api', (req, res) => {
    res.send('Voting System API is running');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR REQ:', req.path, 'ERR:', err);
    if (!res.headersSent) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

if (require.main === module && process.env.NODE_ENV !== 'production') {
    // Connect DB first, then start accepting requests
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch((err) => {
        console.error('❌ Failed to connect to MongoDB. Server not started.', err.message);
        process.exit(1);
    });
}

export default app;
