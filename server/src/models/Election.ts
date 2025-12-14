import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Student Council Election'
    },
    description: {
        type: String,
        required: true,
        default: 'Vote for your next student council representatives.'
    },
    startDate: {
        type: Date,
        required: true,
        // Default to today
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true,
        // Default to 7 days from now
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
    },
    resultsPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Election = mongoose.model('Election', electionSchema);

export default Election;
