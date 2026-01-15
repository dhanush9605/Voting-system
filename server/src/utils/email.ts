import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER?.trim();
const EMAIL_PASS = process.env.EMAIL_PASS?.trim();
const SMTP_HOST = process.env.SMTP_HOST?.trim() || 'smtp-relay.brevo.com';

// Create the transporter globally so we don't open a new connection for every email
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 2525,
    secure: false, // true for 465, false for other ports
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
        console.log("❌ Email Service Error:", error);
    } else {
        console.log("✅ Email Service is ready to take messages");
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    // Trim credentials to avoid whitespace issues
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();

    if (!user || !pass) {
        console.warn('⚠️ Email credentials missing. Please check .env');
        throw new Error("Email credentials missing on server.");
    }

    const mailOptions = {
        from: `"Voting System" <${process.env.SENDER_EMAIL || user}>`,
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error: any) {
        console.error("❌ Send Mail Failed:", error);
        throw error; // Rethrow to be handled by controller
    }
};
