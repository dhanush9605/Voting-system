import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    emailNotificationsEnabled: boolean;
    maintenanceMode: boolean;
    maintenanceTitle: string;
    maintenanceMessage: string;
    estimatedEndTime: string;
    allowAdminBypass: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
    emailNotificationsEnabled: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceTitle: {
        type: String,
        default: 'System Under Maintenance'
    },
    maintenanceMessage: {
        type: String,
        default: 'Vora is currently undergoing scheduled maintenance to improve system performance and security. Please check back soon.'
    },
    estimatedEndTime: {
        type: String,
        default: ''
    },
    allowAdminBypass: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
