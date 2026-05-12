import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    const User = require('./src/models/User').default;
    await User.updateMany({}, { 
        $set: { hasVoted: false }, 
        $unset: { voteTransactionHash: '', votedAt: '' } 
    });
    console.log('Fixed DB state!');
    process.exit(0);
});
