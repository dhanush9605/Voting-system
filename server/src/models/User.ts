import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
    VOTER = 'voter',
    ADMIN = 'admin',
    CANDIDATE = 'candidate'
}

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    studentId?: string;
    verificationStatus?: VerificationStatus;
    isFaceVerified?: boolean;
    hasVoted: boolean;
    loginAttempts: number;
    lockUntil?: Date;
    imageHash?: string;
    imageUrl?: string;
    idCardUrl?: string;
    voteTransactionHash?: string;
    votedAt?: Date;
    votedElections: mongoose.Types.ObjectId[];
    votingRecords: Array<{
        electionId: mongoose.Types.ObjectId;
        transactionHash?: string;
        votedAt: Date;
    }>;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.VOTER
    },
    studentId: { type: String, unique: true, sparse: true },
    verificationStatus: {
        type: String,
        enum: Object.values(VerificationStatus),
        default: VerificationStatus.PENDING
    },
    isFaceVerified: { type: Boolean, default: false },
    hasVoted: { type: Boolean, default: false },
    votedElections: [{ type: Schema.Types.ObjectId, ref: 'Election' }],
    votingRecords: [{
        electionId: { type: Schema.Types.ObjectId, ref: 'Election' },
        transactionHash: { type: String },
        votedAt: { type: Date, default: Date.now }
    }],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    imageHash: { type: String },
    imageUrl: { type: String },
    idCardUrl: { type: String },
    voteTransactionHash: { type: String },
    votedAt: { type: Date },
    refreshToken: { type: String }
}, {
    timestamps: true
});

// Optimization for Admin Dashboard (Get All Voters)
UserSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);
