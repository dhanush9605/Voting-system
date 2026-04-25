import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    emailNotificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
    emailNotificationsEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
