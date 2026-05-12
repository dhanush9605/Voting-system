import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    require('./src/models/Election');
    const User = require('./src/models/User').default;
    const users = await User.find({}).populate('votingRecords.electionId', 'title startDate endDate');
    console.log(JSON.stringify(users[0], null, 2));
    process.exit(0);
});
