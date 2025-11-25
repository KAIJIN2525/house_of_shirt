import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  login,
  profile,
  signup,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Local authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protectRoute, profile);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const payload = { user: { id: req.user._id, role: req.user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) {
          console.error("Error in generating JWT token:", err);
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=token_generation_failed`
          );
        }

        // Prepare user data to send
        const userData = {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        };

        // Send the user and token in response via postMessage
        res.send(`
          <html>
            <body>
              <script>
                const data = {
                  type: "oauth_complete",
                  token: "${token}",
                  user: ${JSON.stringify(userData)}
                };
                
                if (window.opener) {
                  window.opener.postMessage(data, "${
                    process.env.FRONTEND_URL || "http://localhost:5173"
                  }");
                  window.close();
                } else {
                  // Fallback: redirect to frontend with token in URL
                  window.location.href = "${
                    process.env.FRONTEND_URL || "http://localhost:5173"
                  }/auth/callback?token=${token}";
                }
              </script>
              <p>Authentication successful! Closing window...</p>
            </body>
          </html>
        `);
      }
    );
  }
);

export default router;
