import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-system';
        
        // Basic check for placeholder strings
        if (mongoURI.includes('<username>') || mongoURI.includes('cluster.mongodb.net')) {
             console.warn('⚠️ MONGO_URI contains placeholders or likely invalid Atlas URI. Attempting connection anyway...');
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️ Server will continue running, but database features will be unavailable.');
    }
};

export default connectDB;
