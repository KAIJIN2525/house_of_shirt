import dotenv from "dotenv";
import { sendVerificationEmail } from "./config/email.js";

dotenv.config();

// Test email sending
const testEmail = async () => {
  try {
    console.log("Testing email configuration...");
    console.log(`Sending test email to: ${process.env.EMAIL_USER}`);

    const result = await sendVerificationEmail(
      process.env.EMAIL_USER, // Send to yourself
      "test-token-123", // Dummy token
      "Test User"
    );

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log("Check your inbox for the verification email.");
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

testEmail();
