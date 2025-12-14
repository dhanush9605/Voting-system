import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    party: string;
    manifesto: string;
    imageUrl?: string;
    voteCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CandidateSchema: Schema = new Schema({
    name: { type: String, required: true },
    party: { type: String, required: true },
    manifesto: { type: String, required: true },
    imageUrl: { type: String },
    voteCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
