import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Automatically sets host to smtp.gmail.com and port to 465/587 with correct security
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Email credentials missing. Skipping email send.');
            return;
        }

        const info = await transporter.sendMail({
            from: `"Voting System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Don't throw, just log. We don't want to break the registration flow if email fails.
        return null;
    }
};
