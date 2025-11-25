import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../config/email.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      name,
      isEmailVerified: false,
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with the user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) throw err;

        // Send the user and token in response
        res.status(200).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          token,
          message:
            "Registration successful! Please check your email to verify your account.",
        });
      }
    );
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    // Skip password check for Google OAuth users (they're auto-verified)
    if (user.googleId) {
      // Create JWT Payload
      const payload = { user: { id: user._id, role: user.role } };

      // Sign and return the token along with the user data
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) throw err;

          // Send the user and token in response
          res.json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isEmailVerified: true, // Google users are auto-verified
            },
            token,
          });
        }
      );
    } else {
      // For local users, check the password
      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid Credentials" });

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
          emailNotVerified: true,
          userId: user._id,
        });
      }

      // Create JWT Payload
      const payload = { user: { id: user._id, role: user.role } };

      // Sign and return the token along with the user data
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) throw err;

          // Send the user and token in response
          res.json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isEmailVerified: user.isEmailVerified,
            },
            token,
          });
        }
      );
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.name);

    res.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.log("Error in resendVerificationEmail controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({
      success: true,
      message: "Password reset email sent! Please check your inbox.",
    });
  } catch (error) {
    console.log("Error in forgotPassword controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  res.json(req.user);
};

export const logout = async (req, res) => {};
