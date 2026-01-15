import { sendEmail } from '../utils/email';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
    console.log("Testing email sending...");
    const user = (process.env.EMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || '').trim();

    console.log("User:", user);
    console.log("Pass Length:", pass.length);

    const result = await sendEmail({
        to: user, // Send to self
        subject: 'Test Email from Voting System',
        html: '<p>This is a test email to verify configuration.</p>'
    });

    if (result) {
        console.log("✅ Email test passed!");
    } else {
        console.error("❌ Email test failed. See logs above.");
    }
    process.exit(0);
};

testEmail();
