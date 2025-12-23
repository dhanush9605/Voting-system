import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';

dotenv.config();


export const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

app.use(cors({
    origin: true, // Allow all origins for local testing
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());





import uploadRoutes from './routes/uploadRoutes';
import faceRoutes from './routes/faceRoutes';
import adminRoutes from './routes/adminRoutes';
import candidateRoutes from './routes/candidateRoutes';
import voteRoutes from './routes/voteRoutes';
import electionRoutes from './routes/electionRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/election', electionRoutes);

app.get('/', (req, res) => {
    res.send('Voting System API is running');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
