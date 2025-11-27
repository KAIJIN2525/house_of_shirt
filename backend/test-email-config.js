import dotenv from "dotenv";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./config/email.js";

dotenv.config();

// Test email configuration
async function testEmail() {
  console.log("\n🧪 Testing Email Configuration...\n");

  // Display current configuration
  console.log("📋 Current Configuration:");
  console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || "NOT SET"}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || "NOT SET"}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || "NOT SET"}`);
  console.log(
    `   FRONTEND_URL: ${
      process.env.FRONTEND_URL || "NOT SET (will use fallback)"
    }`
  );
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);

  if (process.env.EMAIL_SERVICE === "smtp") {
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || "NOT SET"}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || "587 (default)"}`);
  }

  console.log("\n");

  // Get test email from command line argument or use default
  const testEmailAddress =
    process.argv[2] || process.env.EMAIL_USER || "test@example.com";

  if (!testEmailAddress || testEmailAddress === "test@example.com") {
    console.error("❌ Please provide a valid email address to test:");
    console.error("   node test-email-config.js your-email@example.com");
    process.exit(1);
  }

  console.log(`📧 Sending test verification email to: ${testEmailAddress}\n`);

  try {
    // Test verification email
    const verificationResult = await sendVerificationEmail(
      testEmailAddress,
      "test-token-12345",
      "Test User"
    );

    if (verificationResult.success) {
      console.log("✅ Verification email sent successfully!");
      console.log("   Check your inbox and spam folder.");
      console.log("   Verify the URL in the email is correct.\n");
    } else {
      console.error("❌ Failed to send verification email:");
      console.error(`   ${verificationResult.error}\n`);
    }

    // Test password reset email
    console.log(
      `📧 Sending test password reset email to: ${testEmailAddress}\n`
    );

    const resetResult = await sendPasswordResetEmail(
      testEmailAddress,
      "reset-token-67890",
      "Test User"
    );

    if (resetResult.success) {
      console.log("✅ Password reset email sent successfully!");
      console.log("   Check your inbox and spam folder.");
      console.log("   Verify the URL in the email is correct.\n");
    } else {
      console.error("❌ Failed to send password reset email:");
      console.error(`   ${resetResult.error}\n`);
    }

    console.log("✅ Email testing complete!");
    console.log("\n📝 Things to check in the received emails:");
    console.log("   1. Emails arrived in inbox (or spam)");
    console.log(
      "   2. URLs contain correct domain (not localhost in production)"
    );
    console.log("   3. Email formatting looks good");
    console.log("   4. Links are clickable\n");
  } catch (error) {
    console.error("❌ Error during email test:");
    console.error(`   ${error.message}`);
    console.error("\n🔧 Common issues:");
    console.error("   - Invalid Gmail credentials (use App Password!)");
    console.error("   - Port 465 blocked (use port 587 instead)");
    console.error("   - SMTP credentials incorrect");
    console.error("   - Firewall blocking SMTP connection");
    console.error(
      "\n📖 See EMAIL_SETUP_GUIDE.md for detailed troubleshooting\n"
    );
    process.exit(1);
  }
}

testEmail();
