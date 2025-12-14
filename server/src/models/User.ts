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
    hasVoted: boolean;
    imageHash?: string;
    imageUrl?: string;
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
    hasVoted: { type: Boolean, default: false },
    imageHash: { type: String },
    imageUrl: { type: String },
    refreshToken: { type: String },
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
