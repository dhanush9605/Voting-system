import dotenv from 'dotenv';
dotenv.config();
console.log('TRACE: dotenv.config() called');

import express from 'express';
console.log('TRACE: express imported');
import cors from 'cors';
console.log('TRACE: cors imported');
import cookieParser from 'cookie-parser';
console.log('TRACE: cookie-parser imported');
import connectDB from './config/db';
console.log('TRACE: connectDB imported');

import authRoutes from './routes/authRoutes';
console.log('TRACE: authRoutes imported');
import uploadRoutes from './routes/uploadRoutes';
console.log('TRACE: uploadRoutes imported');
import adminRoutes from './routes/adminRoutes';
console.log('TRACE: adminRoutes imported');
import candidateRoutes from './routes/candidateRoutes';
console.log('TRACE: candidateRoutes imported');
import voteRoutes from './routes/voteRoutes';
console.log('TRACE: voteRoutes imported');
import electionRoutes from './routes/electionRoutes';
console.log('TRACE: electionRoutes imported');

export const app = express();
console.log('TRACE: app initialized');

const PORT = process.env.PORT || 5000;

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    console.log('TRACE: Calling connectDB()');
    connectDB();
}

console.log('TRACE: Configuring CORS');
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

console.log('TRACE: Configuring express.json');
app.use(express.json());
console.log('TRACE: Configuring express.urlencoded');
app.use(express.urlencoded({ extended: true }));
console.log('TRACE: Configuring cookieParser');
app.use(cookieParser());

// Trust Proxy (Required for Secure Coookies on Render/Heroku)
console.log('TRACE: Configuring trust proxy');
app.set('trust proxy', 1);

console.log('TRACE: Registering routes');
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/election', electionRoutes);

app.get('/', (req, res) => {
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

console.log('TRACE: Setup complete.');

if (require.main === module && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
