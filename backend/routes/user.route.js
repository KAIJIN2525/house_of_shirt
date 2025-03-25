import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { login, profile, signup } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Local authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protectRoute, profile);

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
          res.status(500).json({ message: "Error in generating JWT token" });
        }

        // Send the user and token in response
        res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage("oauth_complete", "${process.env.FRONTEND_URL}");
                window.close();
              </script>
            </body>
          </html>
        `);
      }
    );
  }
);

export default router;
