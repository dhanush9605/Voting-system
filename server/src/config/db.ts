import mongoose from 'mongoose';

// Connection caching for Serverless
let cached: any = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-system';
        
        // Basic check for placeholder strings
        if (mongoURI.includes('<username>') || mongoURI.includes('cluster.mongodb.net')) {
             console.warn('⚠️ MONGO_URI contains placeholders or likely invalid Atlas URI.');
        }

        console.log('📡 Connecting to MongoDB...');
        cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
            console.log(`✅ MongoDB Connected`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e: any) {
        cached.promise = null;
        console.error(`❌ MongoDB Connection Error: ${e.message}`);
        throw e;
    }

    return cached.conn;
};

export default connectDB;
