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
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
