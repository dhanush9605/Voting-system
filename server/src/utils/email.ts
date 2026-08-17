import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER?.trim();
const EMAIL_PASS = process.env.EMAIL_PASS?.trim();
const SMTP_HOST = process.env.SMTP_HOST?.trim() || 'smtp-relay.brevo.com';

// Create the transporter globally
const createTransporter = () => {
    if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER.includes('user@example.com')) {
        console.warn("⚠️ Email credentials missing or placeholder. Email service will be disabled.");
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: 2525,
        secure: false, 
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    // Verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.error("❌ Email Service Error:", error);
        } else {
            console.log("✅ Email service ready");
        }
    });

    return transporter;
};

const transporter = createTransporter();

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

import Settings from '../models/Settings.js';

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    if (!transporter) {
        console.warn('⚠️ Cannot send email: Transporter not initialized. Check .env');
        throw new Error("Email service is not configured.");
    }

    try {
        // Check global settings
        const settings = await Settings.findOne();
        if (settings && settings.emailNotificationsEnabled === false) {
            console.log(`🔇 Email notifications are disabled globally. Skipping email to ${to}`);
            return null; // Gracefully act like it succeeded without actually sending
        }

        const mailOptions = {
            from: `"Voting System" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error: any) {
        console.error("❌ Send Mail Failed:", error);
        throw error; // Rethrow to be handled by controller if necessary
    }
};
